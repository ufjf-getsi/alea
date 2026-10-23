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

import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/mapConfig";
import type { FeatureType, MapMode } from "@/lib/maps/types";
import { BaseLayers } from "@/components/map/baseLayers";
import { DrawPanel } from "@/components/map/drawPanel";
import { FeaturePanel } from "@/components/map/featurePanel";
import {
  ClickHandler,
  UserLocation,
  ViewportWatcher,
} from "@/lib/maps/mapInteractions";
import { MapToolbar } from "@/components/map/mapToolbar";
import { PersistedLayers } from "@/lib/maps/persistedLayers";
import { useDrawing } from "@/lib/maps/useDrawing";
import { useMapFeatures } from "@/lib/maps/useMapFeatures";
import { errorMessage, useMapMutations } from "@/lib/maps/useMapMutations";
import styles from "./map.module.css";

// Leaflet's default icons break with bundlers so we point them to the package files
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x.src,
  iconUrl: icon.src,
  shadowUrl: shadow.src,
});

const DRAFT_STYLE = { color: "#16a34a", weight: 2, dashArray: "4 4" };
const VERTEX_STYLE = {
  color: "#16a34a",
  fillColor: "#ffffff",
  fillOpacity: 1,
  weight: 2,
  interactive: false,
};

type Selection = { type: FeatureType; id: string };

export default function MapView({ canEdit }: { canEdit: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection | null>(null);

  const { state: drawState, actions: draw } = useDrawing();
  const { mode, present: draft } = drawState;
  const drawing = mode !== "view";

  const { features, onBoundsChange } = useMapFeatures();
  const { createMarker, createRegion, renameFeature, deleteFeature } =
    useMapMutations();
  const saving = createMarker.isPending || createRegion.isPending;

  const changeMode = (next: MapMode) => {
    draw.setMode(next);
    setError(null);
    setSelected(null);
  };

  const handleMapClick = (latlng: L.LatLng) =>
    draw.addPoint([latlng.lat, latlng.lng]);

  const handleSave = async (name: string) => {
    if (draft.length === 0) return;
    setError(null);
    try {
      if (mode === "marker") {
        const [lat, lng] = draft[0];
        await createMarker.mutateAsync({ name, lat, lng });
      } else if (mode === "region") {
        await createRegion.mutateAsync({ name, points: draft });
      }
      changeMode("view");
    } catch (err) {
      setError(errorMessage(err, "Não foi possível salvar. Tente novamente."));
    }
  };

  const select = useCallback(
    (type: FeatureType, id: string) => {
      if (!drawing) setSelected({ type, id });
    },
    [drawing],
  );

  const list: { id: string; name: string }[] =
    selected?.type === "marker" ? features.markers : features.regions;
  const selectedItem = selected
    ? list.find((item) => item.id === selected.id)
    : undefined;

  const handleRename = async (name: string) => {
    if (!selected) return "Nada selecionado.";
    try {
      await renameFeature.mutateAsync({ ...selected, name });
      return null;
    } catch (err) {
      return errorMessage(err);
    }
  };

  const handleDelete = async () => {
    if (!selected) return "Nada selecionado.";
    try {
      await deleteFeature.mutateAsync(selected);
      setSelected(null);
      return null;
    } catch (err) {
      return errorMessage(err);
    }
  };

  return (
    <div className={styles.wrapper}>
      {canEdit && <MapToolbar mode={mode} onChange={changeMode} />}

      {features.truncated && (
        <div className={styles.notice} role="status">
          Há itens demais nesta área e alguns não estão sendo exibidos. Aproxime
          o zoom para ver todos.
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
      >
        <BaseLayers />
        <ViewportWatcher onChange={onBoundsChange} />
        <ClickHandler enabled={drawing} onClick={handleMapClick} />
        <UserLocation />

        <PersistedLayers
          markers={features.markers}
          regions={features.regions}
          selectedId={selected?.id ?? null}
          onSelect={select}
        />

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
          onUndo={draw.undo}
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
