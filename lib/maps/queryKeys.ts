import type { BBox } from "@/lib/maps/types";

export const mapKeys = {
  features: ["map", "features"] as const,
  bbox: (bbox: BBox | null) => ["map", "features", bbox] as const,
};
