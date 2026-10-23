import { z } from "zod";

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

export const createMarkerSchema = z.object({ name, lat, lng });
export type CreateMarkerInput = z.infer<typeof createMarkerSchema>;

export const createRegionSchema = z.object({ name, points });
export type CreateRegionInput = z.infer<typeof createRegionSchema>;

export const renameFeatureSchema = z.object({ type: featureType, id, name });
export type RenameFeatureInput = z.infer<typeof renameFeatureSchema>;

export const deleteFeatureSchema = z.object({ type: featureType, id });
export type DeleteFeatureInput = z.infer<typeof deleteFeatureSchema>;

// export const updateRegionGeometrySchema = z.object({ id, points });
// export type UpdateRegionGeometryInput = z.infer<
//   typeof updateRegionGeometrySchema
// >;

// export const moveMarkerSchema = z.object({ id, lat, lng });
// export type MoveMarkerInput = z.infer<typeof moveMarkerSchema>;
