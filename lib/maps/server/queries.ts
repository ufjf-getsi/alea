import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { asc, desc, sql } from "drizzle-orm";
import { db } from "@/db/db";
import { mapMarker, mapRegion } from "@/db/schema";
import { MAP_CACHE_TAG } from "@/lib/maps/mapConfig";
import { fromPointGeometry, fromPolygonGeometry } from "@/lib/maps/geo";
import { parsePoint, parsePolygon } from "./projections";
import type { BBox, MapData } from "@/lib/maps/types";

const MAX_RESULTS = 500;
const TOLERANCE_DIVISOR = 2048;
const MAX_DECIMALS = 6;

const decimalsFor = (tolerance: number) =>
  Math.min(MAX_DECIMALS, Math.max(0, Math.ceil(-Math.log10(tolerance))));

export async function getMapData(bbox: BBox): Promise<MapData> {
  "use cache";
  cacheTag(MAP_CACHE_TAG);
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });

  const { minLat, minLng, maxLat, maxLng } = bbox;
  const envelope = sql`ST_MakeEnvelope(${minLng}::float8, ${minLat}::float8, ${maxLng}::float8, ${maxLat}::float8, 4326)`;
  const tolerance = (maxLng - minLng) / TOLERANCE_DIVISOR;
  const decimals = decimalsFor(tolerance);

  const [markerRows, regionRows] = await Promise.all([
    db
      .select({
        id: mapMarker.id,
        name: mapMarker.name,
        geometry: sql`ST_AsGeoJSON(${mapMarker.geom})`
          .mapWith(parsePoint)
          .as("geometry"),
      })
      .from(mapMarker)
      .where(sql`ST_Intersects(${mapMarker.geom}, ${envelope})`)
      .orderBy(desc(mapMarker.createdAt), asc(mapMarker.id))
      .limit(MAX_RESULTS + 1),
    db
      .select({
        id: mapRegion.id,
        name: mapRegion.name,
        geometry: sql`
      ST_AsGeoJSON(
        ST_SimplifyPreserveTopology(${mapRegion.geom}, ${tolerance}::float8),
        ${decimals}::int
      )`
          .mapWith(parsePolygon)
          .as("geometry"),
      })
      .from(mapRegion)
      .where(sql`ST_Intersects(${mapRegion.geom}, ${envelope})`)
      .orderBy(desc(mapRegion.createdAt), asc(mapRegion.id))
      .limit(MAX_RESULTS + 1),
  ]);

  return {
    markers: markerRows.slice(0, MAX_RESULTS).map(({ id, name, geometry }) => ({
      id,
      name,
      position: fromPointGeometry(geometry),
    })),
    regions: regionRows.slice(0, MAX_RESULTS).map(({ id, name, geometry }) => ({
      id,
      name,
      positions: fromPolygonGeometry(geometry),
    })),
    truncated:
      markerRows.length > MAX_RESULTS || regionRows.length > MAX_RESULTS,
  };
}
