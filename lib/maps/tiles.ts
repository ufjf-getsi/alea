import type { BBox } from "./types";

export type Tile = { z: number; x: number; y: number };

export const MAX_TILE_ZOOM = 22;
const MAX_LAT = 85.0511287798; // map projection limit

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const tileId = ({ z, x, y }: Tile) => `${z}/${x}/${y}`;

export function tileBBox({ z, x, y }: Tile): BBox {
  const n = 2 ** z;
  const lng = (i: number) => (i / n) * 360 - 180;
  const lat = (j: number) =>
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * j) / n))) * 180) / Math.PI;

  return {
    minLng: lng(x),
    maxLng: lng(x + 1),
    maxLat: lat(y),
    minLat: lat(y + 1),
  };
}

export function tilesForBounds(b: BBox, z: number): Tile[] {
  const n = 2 ** z;
  const toX = (lng: number) =>
    clamp(Math.floor(((lng + 180) / 360) * n), 0, n - 1);
  const toY = (lat: number) => {
    const rad = (clamp(lat, -MAX_LAT, MAX_LAT) * Math.PI) / 180;
    const y = (1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2;
    return clamp(Math.floor(y * n), 0, n - 1);
  };

  const x0 = toX(b.minLng);
  const x1 = toX(b.maxLng);
  const y0 = toY(b.maxLat);
  const y1 = toY(b.minLat);

  const tiles: Tile[] = [];
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) tiles.push({ z, x, y });
  }
  return tiles;
}
