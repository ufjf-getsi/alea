import type { PointGeometry, PolygonGeometry } from "../types";

const parseJSON = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);

export const parsePoint = (v: unknown) => parseJSON(v) as PointGeometry;
export const parsePolygon = (v: unknown) => parseJSON(v) as PolygonGeometry;
