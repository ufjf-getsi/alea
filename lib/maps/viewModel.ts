import type { LatLng, MapData } from "./types";

export type ViewMarker = { id: string; name: string; position: LatLng };
export type ViewRegion = { id: string; name: string; positions: LatLng[][] };
export type ViewData = {
  markers: ViewMarker[];
  regions: ViewRegion[];
  truncated: boolean;
};

export const EMPTY_VIEW_DATA: ViewData = {
  markers: [],
  regions: [],
  truncated: false,
};

export const toViewData = (d: MapData): ViewData => ({
  markers: d.markers.map(({ id, name, lat, lng }) => ({
    id,
    name,
    position: [lat, lng],
  })),
  regions: d.regions.map(({ id, name, geometry }) => ({
    id,
    name,
    positions: geometry.coordinates.map((ring) =>
      ring.map(([lng, lat]) => [lat, lng] as LatLng),
    ),
  })),
  truncated: d.truncated,
});
