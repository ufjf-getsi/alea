import type { Tile } from "@/lib/maps/tiles";

export const mapKeys = {
  tiles: ["map", "tiles"] as const,
  tile: ({ z, x, y }: Tile) => ["map", "tiles", z, x, y] as const,
};
