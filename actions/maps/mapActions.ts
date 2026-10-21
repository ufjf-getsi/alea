"use server";

import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/db";
import { mapMarker, mapRegion } from "@/db/schema";
import { getFreshSession } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/auth/roles";
import {
  bboxSchema,
  createMarkerSchema,
  createRegionSchema,
  deleteFeatureSchema,
  renameFeatureSchema,
  type CreateMarkerInput,
  type CreateRegionInput,
  type DeleteFeatureInput,
  type RenameFeatureInput,
} from "@/lib/validations/map";
import type {
  ActionResult,
  BBox,
  MapData,
  MapMarker,
  MapRegion,
  PolygonGeometry,
} from "@/lib/maps/types";

const MAX_RESULTS = 500;

const fail = (error: string) => ({ ok: false, error }) as const;
const DENIED = fail("Sem permissão.");

async function authorize(permission: Permission) {
  const session = await getFreshSession();
  if (!session || !can(session.user.roleLevel, permission)) return null;
  return session.user;
}

export async function getMapDataInBounds(
  input: BBox,
): Promise<ActionResult<MapData>> {
  if (!(await authorize("maps:view"))) return DENIED;

  const parsed = bboxSchema.safeParse(input);
  if (!parsed.success) return fail("Área inválida.");
  const { minLat, minLng, maxLat, maxLng } = parsed.data;

  const [markers, regions] = await Promise.all([
    db
      .select({
        id: mapMarker.id,
        name: mapMarker.name,
        lat: mapMarker.lat,
        lng: mapMarker.lng,
      })
      .from(mapMarker)
      .where(
        and(
          gte(mapMarker.lat, minLat),
          lte(mapMarker.lat, maxLat),
          gte(mapMarker.lng, minLng),
          lte(mapMarker.lng, maxLng),
        ),
      )
      .limit(MAX_RESULTS),
    db
      .select({
        id: mapRegion.id,
        name: mapRegion.name,
        geometry: mapRegion.geometry,
      })
      .from(mapRegion)
      .where(
        and(
          lte(mapRegion.minLat, maxLat),
          gte(mapRegion.maxLat, minLat),
          lte(mapRegion.minLng, maxLng),
          gte(mapRegion.maxLng, minLng),
        ),
      )
      .limit(MAX_RESULTS),
  ]);

  return { ok: true, data: { markers, regions } };
}

export async function createMarker(
  input: CreateMarkerInput,
): Promise<ActionResult<MapMarker>> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = createMarkerSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const [row] = await db
    .insert(mapMarker)
    .values({ ...parsed.data, createdBy: user.id })
    .returning({
      id: mapMarker.id,
      name: mapMarker.name,
      lat: mapMarker.lat,
      lng: mapMarker.lng,
    });

  return { ok: true, data: row };
}

export async function createRegion(
  input: CreateRegionInput,
): Promise<ActionResult<MapRegion>> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = createRegionSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const { name, points } = parsed.data;

  const ring = points.map(([lat, lng]) => [lng, lat] as [number, number]);
  ring.push(ring[0]); // closes polygon
  const geometry: PolygonGeometry = { type: "Polygon", coordinates: [ring] };

  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);

  const [row] = await db
    .insert(mapRegion)
    .values({
      name,
      geometry,
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      createdBy: user.id,
    })
    .returning({
      id: mapRegion.id,
      name: mapRegion.name,
      geometry: mapRegion.geometry,
    });

  return { ok: true, data: row };
}

export async function renameFeature(
  input: RenameFeatureInput,
): Promise<ActionResult> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = renameFeatureSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const { type, id, name } = parsed.data;
  const isAdmin = can(user.roleLevel, "users:manage");

  const updated =
    type === "marker"
      ? await db
          .update(mapMarker)
          .set({ name })
          .where(
            and(
              eq(mapMarker.id, id),
              isAdmin ? undefined : eq(mapMarker.createdBy, user.id),
            ),
          )
          .returning({ id: mapMarker.id })
      : await db
          .update(mapRegion)
          .set({ name })
          .where(
            and(
              eq(mapRegion.id, id),
              isAdmin ? undefined : eq(mapRegion.createdBy, user.id),
            ),
          )
          .returning({ id: mapRegion.id });

  if (!updated.length) return fail("Item não encontrado ou sem permissão.");
  return { ok: true, data: null };
}

export async function deleteFeature(
  input: DeleteFeatureInput,
): Promise<ActionResult> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = deleteFeatureSchema.safeParse(input);
  if (!parsed.success) return fail("Dados inválidos.");
  const { type, id } = parsed.data;
  const isAdmin = can(user.roleLevel, "users:manage");

  const deleted =
    type === "marker"
      ? await db
          .delete(mapMarker)
          .where(
            and(
              eq(mapMarker.id, id),
              isAdmin ? undefined : eq(mapMarker.createdBy, user.id),
            ),
          )
          .returning({ id: mapMarker.id })
      : await db
          .delete(mapRegion)
          .where(
            and(
              eq(mapRegion.id, id),
              isAdmin ? undefined : eq(mapRegion.createdBy, user.id),
            ),
          )
          .returning({ id: mapRegion.id });

  if (!deleted.length) return fail("Item não encontrado ou sem permissão.");
  return { ok: true, data: null };
}
