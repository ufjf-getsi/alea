"use client";

import { useCallback, useState } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

import {
  createMarker,
  createRegion,
  deleteFeature,
  renameFeature,
} from "@/actions/maps/mapActions";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/mapConfig";
import type {
  FeatureType,
  MapData,
  MapMarker,
  MapMode,
  MapRegion,
  PolygonGeometry,
} from "@/lib/maps/types";
import { BaseLayers } from "@/lib/maps/baseLayers";
import { DrawPanel } from "@/lib/maps/drawPanel";
import { FeaturePanel } from "@/lib/maps/featurePanel";
import {
  ClickHandler,
  UserLocation,
  ViewportWatcher,
} from "@/lib/maps/mapInteractions";
import { MapToolbar } from "@/lib/maps/mapToolbar";
import { useViewportData } from "@/lib/maps/useViewportData";
import styles from "./map.module.css";

// Leaflet's default icons break with bundlers so we point them to the package files
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x.src,
  iconUrl: icon.src,
  shadowUrl: shadow.src,
});

const REGION_STYLE = { color: "#2563eb", weight: 2, fillOpacity: 0.2 };
const SELECTED_STYLE = { color: "#f59e0b", weight: 3, fillOpacity: 0.3 };
const DRAFT_STYLE = { color: "#16a34a", weight: 2, dashArray: "4 4" };
const VERTEX_STYLE = {
  color: "#16a34a",
  fillColor: "#ffffff",
  fillOpacity: 1,
  weight: 2,
  interactive: false,
};

type Selection = { type: FeatureType; id: string };

//[lat, lng] tuple without Leaflet's optional altitude value
type Point = [number, number];

// GeoJSON ([lng, lat]) -> Leaflet ([lat, lng])
const toLatLngs = (geometry: PolygonGeometry) =>
  geometry.coordinates.map((ring) =>
    ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple),
  );

function mergeById<T extends { id: string }>(
  prev: Map<string, T>,
  items: T[],
): Map<string, T> {
  if (!items.length) return prev;
  const next = new Map(prev);
  items.forEach((item) => next.set(item.id, item));
  return next;
}

export default function MapView({ canEdit }: { canEdit: boolean }) {
  const [mode, setMode] = useState<MapMode>("view");
  const [draft, setDraft] = useState<Point[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection | null>(null);

  const [markers, setMarkers] = useState<Map<string, MapMarker>>(new Map());
  const [regions, setRegions] = useState<Map<string, MapRegion>>(new Map());

  const handleData = useCallback((data: MapData) => {
    setMarkers((prev) => mergeById(prev, data.markers));
    setRegions((prev) => mergeById(prev, data.regions));
  }, []);
  const onBoundsChange = useViewportData(handleData);

  const changeMode = (next: MapMode) => {
    setMode(next);
    setDraft([]);
    setError(null);
    setSelected(null);
  };

  const handleMapClick = (latlng: L.LatLng) => {
    const point: Point = [latlng.lat, latlng.lng];
    setDraft((prev) => (mode === "marker" ? [point] : [...prev, point]));
  };

  const handleSave = async (name: string) => {
    setSaving(true);
    setError(null);
    try {
      if (mode === "marker") {
        const [lat, lng] = draft[0];
        const res = await createMarker({ name, lat, lng });
        if (!res.ok) return setError(res.error);
        setMarkers((prev) => new Map(prev).set(res.data.id, res.data));
      } else if (mode === "region") {
        const res = await createRegion({ name, points: draft });
        if (!res.ok) return setError(res.error);
        setRegions((prev) => new Map(prev).set(res.data.id, res.data));
      }
      changeMode("view");
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const select = (type: FeatureType, id: string) => {
    if (mode === "view") setSelected({ type, id });
  };

  const selectedItem = selected
    ? selected.type === "marker"
      ? markers.get(selected.id)
      : regions.get(selected.id)
    : undefined;

  const handleRename = async (name: string) => {
    if (!selected) return "Nada selecionado.";
    const res = await renameFeature({ ...selected, name });
    if (!res.ok) return res.error;

    if (selected.type === "marker") {
      setMarkers((prev) => {
        const item = prev.get(selected.id);
        return item ? new Map(prev).set(item.id, { ...item, name }) : prev;
      });
    } else {
      setRegions((prev) => {
        const item = prev.get(selected.id);
        return item ? new Map(prev).set(item.id, { ...item, name }) : prev;
      });
    }
    return null;
  };

  const handleDelete = async () => {
    if (!selected) return "Nada selecionado.";
    const res = await deleteFeature(selected);
    if (!res.ok) return res.error;

    const remove = <T,>(prev: Map<string, T>) => {
      const next = new Map(prev);
      next.delete(selected.id);
      return next;
    };
    if (selected.type === "marker") setMarkers(remove);
    else setRegions(remove);

    setSelected(null);
    return null;
  };

  const drawing = mode !== "view";

  return (
    <div className={styles.wrapper}>
      {canEdit && <MapToolbar mode={mode} onChange={changeMode} />}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
      >
        <BaseLayers />
        <ViewportWatcher onChange={onBoundsChange} />
        <ClickHandler enabled={drawing} onClick={handleMapClick} />
        <UserLocation />

        {[...regions.values()].map((region) => (
          <Polygon
            key={region.id}
            positions={toLatLngs(region.geometry)}
            pathOptions={
              selected?.id === region.id ? SELECTED_STYLE : REGION_STYLE
            }
            eventHandlers={{ click: () => select("region", region.id) }}
          />
        ))}

        {[...markers.values()].map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            eventHandlers={{ click: () => select("marker", marker.id) }}
          />
        ))}

        {mode === "marker" && draft[0] && (
          <Marker position={draft[0]} opacity={0.7} interactive={false} />
        )}
        {mode === "region" && draft.length === 2 && (
          <Polyline positions={draft} pathOptions={DRAFT_STYLE} />
        )}
        {mode === "region" && draft.length >= 3 && (
          <Polygon positions={draft} pathOptions={DRAFT_STYLE} />
        )}
        {mode === "region" &&
          draft.map((point, i) => (
            <CircleMarker
              key={i}
              center={point}
              radius={4}
              pathOptions={VERTEX_STYLE}
            />
          ))}
      </MapContainer>

      {canEdit && drawing && (
        <DrawPanel
          key={mode}
          mode={mode}
          pointCount={draft.length}
          saving={saving}
          error={error}
          onUndo={() => setDraft((prev) => prev.slice(0, -1))}
          onCancel={() => changeMode("view")}
          onSave={handleSave}
        />
      )}

      {!drawing && selected && selectedItem && (
        <FeaturePanel
          key={selected.id}
          type={selected.type}
          initialName={selectedItem.name}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
