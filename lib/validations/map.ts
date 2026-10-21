import { z } from "zod";

const name = z
  .string()
  .trim()
  .min(1, "O nome é obrigatório.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");
const lat = z.number().min(-90).max(90);
const lng = z.number().min(-180).max(180);
const featureType = z.enum(["marker", "region"]);
const id = z.string().min(1).max(100);

export const bboxSchema = z.object({
  minLat: lat,
  minLng: lng,
  maxLat: lat,
  maxLng: lng,
});

export const createMarkerSchema = z.object({ name, lat, lng });
export type CreateMarkerInput = z.infer<typeof createMarkerSchema>;

// points: [lat, lng][]
export const createRegionSchema = z.object({
  name,
  points: z
    .array(z.tuple([lat, lng]))
    .min(3, "O polígono precisa de pelo menos 3 pontos.")
    .max(500, "O polígono pode ter no máximo 500 pontos."),
});
export type CreateRegionInput = z.infer<typeof createRegionSchema>;

export const renameFeatureSchema = z.object({ type: featureType, id, name });
export type RenameFeatureInput = z.infer<typeof renameFeatureSchema>;

export const deleteFeatureSchema = z.object({ type: featureType, id });
export type DeleteFeatureInput = z.infer<typeof deleteFeatureSchema>;
