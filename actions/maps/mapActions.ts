"use server";

import { and, eq, sql } from "drizzle-orm";
import { mapMarker, mapRegion, type PointGeometry } from "@/db/schema";
import { db } from "@/db/db";
import { getFreshSession } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/auth/roles";
import {
  createMarkerSchema,
  createRegionSchema,
  deleteFeatureSchema,
  moveMarkerSchema,
  regionIdSchema,
  renameFeatureSchema,
  updateRegionGeometrySchema,
  type CreateMarkerInput,
  type CreateRegionInput,
  type DeleteFeatureInput,
  type MoveMarkerInput,
  type RegionIdInput,
  type RenameFeatureInput,
  type UpdateRegionGeometryInput,
} from "@/lib/validations/maps";
import type { ActionResult, LatLng, PolygonGeometry } from "@/lib/maps/types";
import { ringToVertices } from "@/lib/maps/drawState";
import { parseGeoJSON } from "@/lib/maps/server/projections";
import { updateTag } from "next/cache";
import { MAP_CACHE_TAG } from "@/lib/maps/mapConfig";

const fail = (error: string) => ({ ok: false, error }) as const;
const DENIED = fail("Sem permissão.");
const NOT_FOUND = fail("Item não encontrado ou sem permissão.");
const INVALID_POLYGON = fail(
  "Polígono inválido: as linhas não podem se cruzar nem ficar alinhadas.",
);

const PG_CHECK_VIOLATION = "23514";

function pgErrorCode(err: unknown): string | undefined {
  const e = err as { code?: string; cause?: { code?: string } } | null;
  return e?.code ?? e?.cause?.code;
}

async function authorize(permission: Permission) {
  const session = await getFreshSession();
  if (!session || !can(session.user.roleLevel, permission)) return null;
  return session.user;
}

type User = NonNullable<Awaited<ReturnType<typeof authorize>>>;

function ownedBy(
  table: typeof mapMarker | typeof mapRegion,
  id: string,
  user: User,
) {
  const isAdmin = can(user.roleLevel, "users:manage");
  return and(
    eq(table.id, id),
    isAdmin ? undefined : eq(table.createdBy, user.id),
  );
}

function toPolygon(points: LatLng[]): PolygonGeometry {
  const ring = points.map(([lat, lng]) => [lng, lat] as [number, number]);
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

export async function createMarker(
  input: CreateMarkerInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = createMarkerSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const { name, lat, lng } = parsed.data;

  const geom: PointGeometry = { type: "Point", coordinates: [lng, lat] };

  const [row] = await db
    .insert(mapMarker)
    .values({ name, geom, createdBy: user.id })
    .returning({ id: mapMarker.id });

  updateTag(MAP_CACHE_TAG);
  return { ok: true, data: row };
}

export async function createRegion(
  input: CreateRegionInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = createRegionSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const { name, points } = parsed.data;

  try {
    const [row] = await db
      .insert(mapRegion)
      .values({ name, geom: toPolygon(points), createdBy: user.id })
      .returning({ id: mapRegion.id });

    updateTag(MAP_CACHE_TAG);
    return { ok: true, data: row };
  } catch (err) {
    if (pgErrorCode(err) === PG_CHECK_VIOLATION) return INVALID_POLYGON;
    throw err;
  }
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

  const table = type === "marker" ? mapMarker : mapRegion;
  const updated = await db
    .update(table)
    .set({ name })
    .where(ownedBy(table, id, user))
    .returning({ id: table.id });

  if (!updated.length) return NOT_FOUND;
  updateTag(MAP_CACHE_TAG);
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

  const table = type === "marker" ? mapMarker : mapRegion;
  const deleted = await db
    .delete(table)
    .where(ownedBy(table, id, user))
    .returning({ id: table.id });

  if (!deleted.length) return NOT_FOUND;
  updateTag(MAP_CACHE_TAG);
  return { ok: true, data: null };
}

export async function moveMarker(
  input: MoveMarkerInput,
): Promise<ActionResult> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = moveMarkerSchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const { id, lat, lng } = parsed.data;

  const geom: PointGeometry = { type: "Point", coordinates: [lng, lat] };
  const updated = await db
    .update(mapMarker)
    .set({ geom })
    .where(ownedBy(mapMarker, id, user))
    .returning({ id: mapMarker.id });

  if (!updated.length) return NOT_FOUND;
  updateTag(MAP_CACHE_TAG);
  return { ok: true, data: null };
}

export async function updateRegionGeometry(
  input: UpdateRegionGeometryInput,
): Promise<ActionResult> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = updateRegionGeometrySchema.safeParse(input);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const { id, points } = parsed.data;

  try {
    const updated = await db
      .update(mapRegion)
      .set({ geom: toPolygon(points) })
      .where(ownedBy(mapRegion, id, user))
      .returning({ id: mapRegion.id });

    if (!updated.length) return NOT_FOUND;
    updateTag(MAP_CACHE_TAG);
    return { ok: true, data: null };
  } catch (err) {
    if (pgErrorCode(err) === PG_CHECK_VIOLATION) return INVALID_POLYGON;
    throw err;
  }
}

export async function getRegionPoints(
  input: RegionIdInput,
): Promise<ActionResult<{ points: LatLng[] }>> {
  const user = await authorize("maps:edit");
  if (!user) return DENIED;

  const parsed = regionIdSchema.safeParse(input);
  if (!parsed.success) return fail("Dados inválidos.");

  const [row] = await db
    .select({
      geometry: sql`ST_AsGeoJSON(${mapRegion.geom})`
        .mapWith(parseGeoJSON)
        .as("geometry"),
    })
    .from(mapRegion)
    .where(ownedBy(mapRegion, parsed.data.id, user))
    .limit(1);

  if (!row) return NOT_FOUND;

  const ring = row.geometry.coordinates[0].map(
    ([lng, lat]) => [lat, lng] as LatLng,
  );
  return { ok: true, data: { points: ringToVertices(ring) } };
}
