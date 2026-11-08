import type { LatLng, PointGeometry, PolygonGeometry } from "./types";

export const toPointGeometry = ([lat, lng]: LatLng): PointGeometry => ({
  type: "Point",
  coordinates: [lng, lat],
});

export function toPolygonGeometry(vertices: LatLng[]): PolygonGeometry {
  const ring = vertices.map(([lat, lng]) => [lng, lat] as [number, number]);
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

export const fromPointGeometry = ({
  coordinates: [lng, lat],
}: PointGeometry): LatLng => [lat, lng];

export const fromPolygonGeometry = ({
  coordinates,
}: PolygonGeometry): LatLng[][] =>
  coordinates.map((ring) => ring.map(([lng, lat]) => [lat, lng] as LatLng));

export function ringToVertices(ring: LatLng[]): LatLng[] {
  const first = ring[0];
  const last = ring[ring.length - 1];
  const closed =
    ring.length > 1 && first[0] === last[0] && first[1] === last[1];
  return closed ? ring.slice(0, -1) : ring;
}

export const polygonToVertices = (geometry: PolygonGeometry): LatLng[] =>
  ringToVertices(fromPolygonGeometry(geometry)[0]);
