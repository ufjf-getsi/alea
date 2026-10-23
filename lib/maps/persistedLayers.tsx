"use client";

import { memo } from "react";
import { Marker, Polygon } from "react-leaflet";
import type { FeatureType } from "./types";
import type { ViewMarker, ViewRegion } from "./viewModel";

const REGION_STYLE = { color: "#2563eb", weight: 2, fillOpacity: 0.2 };
const SELECTED_STYLE = { color: "#f59e0b", weight: 3, fillOpacity: 0.3 };

type OnSelect = (type: FeatureType, id: string) => void;

const RegionLayer = memo(function RegionLayer({
  region,
  selected,
  onSelect,
}: {
  region: ViewRegion;
  selected: boolean;
  onSelect: OnSelect;
}) {
  return (
    <Polygon
      positions={region.positions}
      pathOptions={selected ? SELECTED_STYLE : REGION_STYLE}
      eventHandlers={{ click: () => onSelect("region", region.id) }}
    />
  );
});

const MarkerLayer = memo(function MarkerLayer({
  marker,
  onSelect,
}: {
  marker: ViewMarker;
  onSelect: OnSelect;
}) {
  return (
    <Marker
      position={marker.position}
      eventHandlers={{ click: () => onSelect("marker", marker.id) }}
    />
  );
});

type PersistedLayersProps = {
  markers: ViewMarker[];
  regions: ViewRegion[];
  selectedId: string | null;
  onSelect: OnSelect;
};

export const PersistedLayers = memo(function PersistedLayers({
  markers,
  regions,
  selectedId,
  onSelect,
}: PersistedLayersProps) {
  return (
    <>
      {regions.map((region) => (
        <RegionLayer
          key={region.id}
          region={region}
          selected={region.id === selectedId}
          onSelect={onSelect}
        />
      ))}
      {markers.map((marker) => (
        <MarkerLayer key={marker.id} marker={marker} onSelect={onSelect} />
      ))}
    </>
  );
});
