import { sql } from "drizzle-orm";
import { mapMarker } from "@/db/schema";
import type { PolygonGeometry } from "./types";

export const markerCols = {
  id: mapMarker.id,
  name: mapMarker.name,
  lat: sql<number>`ST_Y(${mapMarker.geom})`.as("lat"),
  lng: sql<number>`ST_X(${mapMarker.geom})`.as("lng"),
};

export const parseGeoJSON = (v: unknown) =>
  (typeof v === "string" ? JSON.parse(v) : v) as PolygonGeometry;
