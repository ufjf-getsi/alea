import { z } from "zod";
import { MIN_TILE_ZOOM } from "@/lib/maps/mapConfig";
import { MAX_TILE_ZOOM } from "@/lib/maps/tiles";

const MAX_SERVED_ZOOM = Math.min(MAX_TILE_ZOOM, 18);

const int = z
  .string()
  .regex(/^\d{1,8}$/)
  .transform(Number);

export const tileSchema = z
  .object({
    z: int.pipe(z.number().min(MIN_TILE_ZOOM).max(MAX_SERVED_ZOOM)),
    x: int,
    y: int,
  })
  .refine(({ z: zoom, x, y }) => x < 2 ** zoom && y < 2 ** zoom);

export type TileInput = z.infer<typeof tileSchema>;
