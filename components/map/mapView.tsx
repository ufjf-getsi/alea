"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import L from "leaflet";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/mapConfig";
import type { FeatureType, MapMode } from "@/lib/maps/types";
import { MIN_REGION_VERTICES } from "@/lib/maps/drawState";
import { initialUiState, uiReducer } from "@/lib/maps/uiState";
import { BaseLayers } from "@/components/map/layers/baseLayers";
import { DrawPanel } from "@/components/map/panels/drawPanel";
import { FeaturePanel } from "@/components/map/panels/featurePanel";
import {
  ClickHandler,
  LocateControl,
  ViewportWatcher,
} from "@/components/map/mapInteractions";
import { MapToolbar } from "@/components/map/mapToolbar";
import { DraftLayer } from "@/components/map/layers/draftLayer";
import { PersistedLayers } from "@/components/map/layers/persistedLayers";
import { useDrawing } from "@/components/map/hooks/useDrawing";
import { useDrawShortcuts } from "@/components/map/hooks/useDrawShortcuts";
import { useMapFeatures } from "@/components/map/hooks/useMapFeatures";
import {
  errorMessage,
  useMapMutations,
} from "@/components/map/hooks/useMapMutations";
import styles from "./map.module.css";

// Leaflet's default icons break with bundlers so we point them to the package files
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x.src,
  iconUrl: icon.src,
  shadowUrl: shadow.src,
});

export default function MapView({ canEdit }: { canEdit: boolean }) {
  const [ui, dispatchUi] = useReducer(uiReducer, initialUiState);
  const { selected, minimized, error } = ui;

  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    if (!locateError) return;
    const t = setTimeout(() => setLocateError(null), 4000);
    return () => clearTimeout(t);
  }, [locateError]);

  const { state: drawState, actions: draw, canUndo, canRedo } = useDrawing();
  const { mode, present: draft, editingId, selectedVertex } = drawState;
  const drawing = mode !== "view";
  const editing = editingId !== null;

  const { features, onBoundsChange, zoomedOut } = useMapFeatures();
  const {
    createMarker,
    createRegion,
    moveMarker,
    updateRegionGeometry,
    loadRegionPoints,
    renameFeature,
    deleteFeature,
  } = useMapMutations();
  const saving =
    createMarker.isPending ||
    createRegion.isPending ||
    moveMarker.isPending ||
    updateRegionGeometry.isPending;

  const setError = (message: string | null) =>
    dispatchUi({ type: "setError", error: message });

  const changeMode = (next: MapMode) => {
    draw.setMode(next);
    dispatchUi({ type: "modeChanged" });
  };

  const finishDrawing = () => {
    draw.setMode("view");
    setError(null);
  };

  const handleMapClick = (latlng: L.LatLng) =>
    draw.addPoint([latlng.lat, latlng.lng]);

  const handleSave = async (name: string) => {
    if (draft.length === 0) return;
    setError(null);
    try {
      if (editingId) {
        if (mode === "marker") {
          const [lat, lng] = draft[0];
          await moveMarker.mutateAsync({ id: editingId, lat, lng });
        } else {
          await updateRegionGeometry.mutateAsync({
            id: editingId,
            points: draft,
          });
        }
      } else if (mode === "marker") {
        const [lat, lng] = draft[0];
        await createMarker.mutateAsync({ name, lat, lng });
      } else if (mode === "region") {
        await createRegion.mutateAsync({ name, points: draft });
      }
      finishDrawing();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível salvar. Tente novamente."));
    }
  };

  const select = useCallback(
    (type: FeatureType, id: string) => {
      if (!drawing) dispatchUi({ type: "select", selection: { type, id } });
    },
    [drawing],
  );

  const selectedMarker =
    selected?.type === "marker"
      ? features.markers.find((m) => m.id === selected.id)
      : undefined;
  const selectedRegion =
    selected?.type === "region"
      ? features.regions.find((r) => r.id === selected.id)
      : undefined;
  const selectedName = (selectedMarker ?? selectedRegion)?.name;

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
      dispatchUi({ type: "deselect" });
      return null;
    } catch (err) {
      return errorMessage(err);
    }
  };

  const handleEditGeometry = async () => {
    if (selectedMarker) {
      draw.startEditing(selectedMarker.id, "marker", [selectedMarker.position]);
      setError(null);
      return null;
    }
    if (!selectedRegion) return "Nada selecionado.";
    try {
      const { points } = await loadRegionPoints.mutateAsync(selectedRegion.id);
      draw.startEditing(selectedRegion.id, "region", points);
      setError(null);
      return null;
    } catch (err) {
      return errorMessage(err);
    }
  };

  const canRemoveVertex =
    mode === "region" &&
    selectedVertex !== null &&
    (!editing || draft.length > MIN_REGION_VERTICES);

  const removeSelectedVertex = () => {
    if (canRemoveVertex && selectedVertex !== null)
      draw.removeVertex(selectedVertex);
  };

  useDrawShortcuts(canEdit && drawing, {
    onUndo: draw.undo,
    onRedo: draw.redo,
    onRemoveVertex: removeSelectedVertex,
    onEscape: finishDrawing,
  });

  const toggleMinimized = () => dispatchUi({ type: "toggleMinimized" });

  return (
    <div className={styles.wrapper}>
      {canEdit && <MapToolbar mode={mode} onChange={changeMode} />}

      {!drawing && zoomedOut && (
        <div className={styles.notice} role="status">
          Aproxime o zoom para buscar mais regiões e marcadores.
        </div>
      )}

      {!drawing && !zoomedOut && features.truncated && (
        <div className={styles.notice} role="status">
          Há itens demais nesta área e alguns não estão sendo exibidos. Aproxime
          o zoom para ver todos.
        </div>
      )}

      {locateError && (
        <div className={styles.notice} role="status">
          {locateError}
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
      >
        <BaseLayers />
        <LocateControl onError={setLocateError} />
        <ViewportWatcher onChange={onBoundsChange} />
        <ClickHandler enabled={drawing && !editing} onClick={handleMapClick} />

        <PersistedLayers
          markers={features.markers}
          regions={features.regions}
          selectedId={selected?.id ?? null}
          hiddenId={editingId}
          dimmed={drawing}
          onSelect={select}
        />

        {mode !== "view" && (
          <DraftLayer
            mode={mode}
            points={draft}
            selectedVertex={selectedVertex}
            onMove={draw.moveVertex}
            onInsert={draw.insertVertex}
            onSelect={draw.selectVertex}
          />
        )}
      </MapContainer>

      {canEdit && mode !== "view" && (
        <DrawPanel
          key={`${mode}-${editingId ?? "new"}`}
          mode={mode}
          editing={editing}
          pointCount={draft.length}
          canUndo={canUndo}
          canRedo={canRedo}
          canRemoveVertex={canRemoveVertex}
          saving={saving}
          error={error}
          minimized={minimized}
          onToggleMinimized={toggleMinimized}
          onUndo={draw.undo}
          onRedo={draw.redo}
          onRemoveVertex={removeSelectedVertex}
          onCancel={finishDrawing}
          onSave={handleSave}
        />
      )}

      {!drawing && selected && selectedName !== undefined && (
        <FeaturePanel
          key={selected.id}
          type={selected.type}
          initialName={selectedName}
          canEdit={canEdit}
          minimized={minimized}
          onToggleMinimized={toggleMinimized}
          onClose={() => dispatchUi({ type: "deselect" })}
          onRename={handleRename}
          onEditGeometry={handleEditGeometry}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
