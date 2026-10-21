export type MapMode = "view" | "marker" | "region";
export type FeatureType = "marker" | "region";

export type BBox = {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
};

// GeoJSON: coordinates [lng, lat]
export type PolygonGeometry = {
  type: "Polygon";
  coordinates: [number, number][][];
};

export type MapMarker = { id: string; name: string; lat: number; lng: number };
export type MapRegion = { id: string; name: string; geometry: PolygonGeometry };
export type MapData = { markers: MapMarker[]; regions: MapRegion[] };

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };
