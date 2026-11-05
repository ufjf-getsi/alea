"use client";

import { useMemo, useState } from "react";
import L from "leaflet";
import { Marker, Polygon, Polyline } from "react-leaflet";
import type { LatLng, MapMode } from "@/lib/maps/types";
import styles from "@/components/map/map.module.css";

const DRAFT_STYLE: L.PathOptions = {
  color: "#16a34a",
  weight: 2,
  dashArray: "4 4",
  interactive: false,
};

const handleIcon = (inner: string) =>
  L.divIcon({
    className: styles.handle,
    html: `<span class="${inner}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const VERTEX_ICON = handleIcon(styles.vertex);
const VERTEX_SELECTED_ICON = handleIcon(
  `${styles.vertex} ${styles.vertexSelected}`,
);
const MIDPOINT_ICON = handleIcon(styles.midpoint);

const midpoint = (a: LatLng, b: LatLng): LatLng => [
  (a[0] + b[0]) / 2,
  (a[1] + b[1]) / 2,
];

type DraftLayerProps = {
  mode: Exclude<MapMode, "view">;
  points: LatLng[];
  selectedVertex: number | null;
  onMove: (index: number, point: LatLng) => void;
  onInsert: (index: number, point: LatLng) => void;
  onSelect: (index: number | null) => void;
};

export function DraftLayer({
  mode,
  points,
  selectedVertex,
  onMove,
  onInsert,
  onSelect,
}: DraftLayerProps) {
  const [drag, setDrag] = useState<{ index: number; point: LatLng } | null>(
    null,
  );

  const mids = useMemo(
    () =>
      points.length >= 3
        ? points.map((p, i) => midpoint(p, points[(i + 1) % points.length]))
        : [],
    [points],
  );

  const commitDrag = (index: number) => (e: L.LeafletEvent) => {
    const ll = (e.target as L.Marker).getLatLng().wrap();
    setDrag(null);
    onMove(index, [ll.lat, ll.lng]);
  };

  if (mode === "marker") {
    if (!points[0]) return null;
    return (
      <Marker
        position={points[0]}
        draggable
        zIndexOffset={1000}
        eventHandlers={{ dragend: commitDrag(0) }}
      />
    );
  }

  const shown = drag
    ? points.map((p, i) => (i === drag.index ? drag.point : p))
    : points;

  return (
    <>
      {shown.length === 2 && (
        <Polyline positions={shown} pathOptions={DRAFT_STYLE} />
      )}
      {shown.length >= 3 && (
        <Polygon positions={shown} pathOptions={DRAFT_STYLE} />
      )}

      {!drag &&
        mids.map((mid, i) => (
          <Marker
            key={`m-${i}`}
            position={mid}
            icon={MIDPOINT_ICON}
            zIndexOffset={-100}
            eventHandlers={{ click: () => onInsert(i + 1, mid) }}
          />
        ))}

      {points.map((p, i) => {
        const selected = i === selectedVertex;
        return (
          <Marker
            key={`v-${i}`}
            position={p}
            draggable
            icon={selected ? VERTEX_SELECTED_ICON : VERTEX_ICON}
            zIndexOffset={selected ? 200 : 100}
            eventHandlers={{
              click: () => onSelect(i),
              drag: (e) => {
                const ll = (e.target as L.Marker).getLatLng();
                setDrag({ index: i, point: [ll.lat, ll.lng] });
              },
              dragend: commitDrag(i),
            }}
          />
        );
      })}
    </>
  );
}
