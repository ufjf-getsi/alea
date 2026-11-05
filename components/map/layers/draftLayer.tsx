"use client";

import { useState } from "react";
import L from "leaflet";
import { Marker, Polygon, Polyline, useMap } from "react-leaflet";
import type { LatLng, MapMode } from "@/lib/maps/types";
import styles from "@/components/map/map.module.css";

const DRAFT_STYLE: L.PathOptions = {
  color: "#16a34a",
  weight: 2,
  dashArray: "4 4",
  interactive: false,
};

const EDGE_HIT_STYLE: L.PathOptions = {
  weight: 28,
  opacity: 0,
  className: styles.edgeHit,
  bubblingMouseEvents: false,
};

const handleIcon = (inner: string) =>
  L.divIcon({
    className: styles.handle,
    html: `<span class="${inner}"></span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const VERTEX_ICON = handleIcon(styles.vertex);
const VERTEX_SELECTED_ICON = handleIcon(
  `${styles.vertex} ${styles.vertexSelected}`,
);

type EdgeHitLayerProps = {
  points: LatLng[];
  onInsert: (index: number, point: LatLng) => void;
};

function EdgeHitLayer({ points, onInsert }: EdgeHitLayerProps) {
  const map = useMap();

  const insertAt = (edge: number, e: L.LeafletMouseEvent) => {
    const a = map.latLngToLayerPoint(points[edge]);
    const b = map.latLngToLayerPoint(points[(edge + 1) % points.length]);
    const projected = L.LineUtil.closestPointOnSegment(e.layerPoint, a, b);
    const ll = map.layerPointToLatLng(projected).wrap();
    onInsert(edge + 1, [ll.lat, ll.lng]);
  };

  return (
    <>
      {points.map((p, i) => (
        <Polyline
          key={`e-${i}`}
          positions={[p, points[(i + 1) % points.length]]}
          pathOptions={EDGE_HIT_STYLE}
          eventHandlers={{ click: (e) => insertAt(i, e) }}
        />
      ))}
    </>
  );
}

type DraftLayerProps = {
  mode: Exclude<MapMode, "view">;
  points: LatLng[];
  editing: boolean;
  selectedVertex: number | null;
  onMove: (index: number, point: LatLng) => void;
  onInsert: (index: number, point: LatLng) => void;
  onSelect: (index: number | null) => void;
};

export function DraftLayer({
  mode,
  points,
  editing,
  selectedVertex,
  onMove,
  onInsert,
  onSelect,
}: DraftLayerProps) {
  const [drag, setDrag] = useState<{ index: number; point: LatLng } | null>(
    null,
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

  const edgeInsertEnabled = editing && !drag && points.length >= 3;

  return (
    <>
      {shown.length === 2 && (
        <Polyline positions={shown} pathOptions={DRAFT_STYLE} />
      )}
      {shown.length >= 3 && (
        <Polygon positions={shown} pathOptions={DRAFT_STYLE} />
      )}

      {edgeInsertEnabled && (
        <EdgeHitLayer points={points} onInsert={onInsert} />
      )}

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
