import { z } from "zod";
import { MAX_BBOX_SPAN } from "@/lib/maps/mapConfig";

const name = z
  .string()
  .trim()
  .min(1, "O nome é obrigatório.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");
const lat = z
  .number()
  .min(-90, "Latitude inválida.")
  .max(90, "Latitude inválida.");
const lng = z
  .number()
  .min(-180, "Longitude inválida.")
  .max(180, "Longitude inválida.");
const featureType = z.enum(["marker", "region"]);

const id = z.uuid({ error: "Identificador inválido." });

const MIN_AREA = 1e-12;
function ringArea(pts: readonly (readonly [number, number])[]) {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const [lat1, lng1] = pts[i];
    const [lat2, lng2] = pts[(i + 1) % pts.length];
    sum += lng1 * lat2 - lng2 * lat1;
  }
  return Math.abs(sum) / 2;
}

const points = z
  .array(z.tuple([lat, lng]))
  .min(3, "O polígono precisa de pelo menos 3 pontos.")
  .max(500, "O polígono pode ter no máximo 500 pontos.")
  .refine(
    (pts) => ringArea(pts) > MIN_AREA,
    "O polígono é degenerado: os pontos estão repetidos ou alinhados.",
  );

const coordParam = z
  .string()
  .regex(/^-?\d{1,3}(\.\d{1,6})?$/)
  .transform(Number);

export const bboxSchema = z
  .object({
    minLat: coordParam.pipe(lat),
    minLng: coordParam.pipe(lng),
    maxLat: coordParam.pipe(lat),
    maxLng: coordParam.pipe(lng),
  })
  .refine((b) => b.minLat < b.maxLat && b.minLng < b.maxLng)
  .refine(
    (b) =>
      b.maxLat - b.minLat <= MAX_BBOX_SPAN &&
      b.maxLng - b.minLng <= MAX_BBOX_SPAN,
  );

export type BBoxInput = z.infer<typeof bboxSchema>;

export const createMarkerSchema = z.object({ name, lat, lng });
export type CreateMarkerInput = z.infer<typeof createMarkerSchema>;

export const createRegionSchema = z.object({ name, points });
export type CreateRegionInput = z.infer<typeof createRegionSchema>;

export const renameFeatureSchema = z.object({ type: featureType, id, name });
export type RenameFeatureInput = z.infer<typeof renameFeatureSchema>;

export const deleteFeatureSchema = z.object({ type: featureType, id });
export type DeleteFeatureInput = z.infer<typeof deleteFeatureSchema>;

export const updateRegionGeometrySchema = z.object({ id, points });
export type UpdateRegionGeometryInput = z.infer<
  typeof updateRegionGeometrySchema
>;

export const moveMarkerSchema = z.object({ id, lat, lng });
export type MoveMarkerInput = z.infer<typeof moveMarkerSchema>;

export const regionIdSchema = z.object({ id });
export type RegionIdInput = z.infer<typeof regionIdSchema>;
