"use client";

import { Marker, Polygon } from "react-leaflet";
import type { FeatureType, MapMarker, MapRegion } from "@/lib/maps/types";

const REGION_STYLE = { color: "#2563eb", weight: 2, fillOpacity: 0.2 };
const SELECTED_STYLE = { color: "#f59e0b", weight: 3, fillOpacity: 0.3 };
const DIMMED_STYLE = {
  color: "#2563eb",
  weight: 1,
  opacity: 0.5,
  fillOpacity: 0.05,
};

type OnSelect = (type: FeatureType, id: string) => void;

function RegionLayer({
  region,
  selected,
  dimmed,
  onSelect,
}: {
  region: MapRegion;
  selected: boolean;
  dimmed: boolean;
  onSelect: OnSelect;
}) {
  return (
    <Polygon
      positions={region.positions}
      pathOptions={
        dimmed ? DIMMED_STYLE : selected ? SELECTED_STYLE : REGION_STYLE
      }
      eventHandlers={{ click: () => onSelect("region", region.id) }}
    />
  );
}

function MarkerLayer({
  marker,
  dimmed,
  onSelect,
}: {
  marker: MapMarker;
  dimmed: boolean;
  onSelect: OnSelect;
}) {
  return (
    <Marker
      position={marker.position}
      opacity={dimmed ? 0.4 : 1}
      eventHandlers={{ click: () => onSelect("marker", marker.id) }}
    />
  );
}

type PersistedLayersProps = {
  markers: MapMarker[];
  regions: MapRegion[];
  selectedId: string | null;
  hiddenId: string | null;
  dimmed: boolean;
  onSelect: OnSelect;
};

export function PersistedLayers({
  markers,
  regions,
  selectedId,
  hiddenId,
  dimmed,
  onSelect,
}: PersistedLayersProps) {
  return (
    <>
      {regions
        .filter((r) => r.id !== hiddenId)
        .map((region) => (
          <RegionLayer
            key={region.id}
            region={region}
            selected={region.id === selectedId}
            dimmed={dimmed}
            onSelect={onSelect}
          />
        ))}
      {markers
        .filter((m) => m.id !== hiddenId)
        .map((marker) => (
          <MarkerLayer
            key={marker.id}
            marker={marker}
            dimmed={dimmed}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}
