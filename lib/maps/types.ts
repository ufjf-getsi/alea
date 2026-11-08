export type MapMode = "view" | "marker" | "region";
export type FeatureType = "marker" | "region";

// app uses Leaflet's coordinate format: [lat, lng]
export type LatLng = [number, number];

export type BBox = {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
};

// GeoJSON uses [lng, lat]
export type PointGeometry = { type: "Point"; coordinates: [number, number] };
export type PolygonGeometry = {
  type: "Polygon";
  coordinates: [number, number][][];
};

export type MapMarker = { id: string; name: string; position: LatLng };
export type MapRegion = { id: string; name: string; positions: LatLng[][] };
export type MapData = {
  markers: MapMarker[];
  regions: MapRegion[];
  truncated: boolean;
};

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };
