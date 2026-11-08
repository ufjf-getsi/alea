"use client";

import { useEffect, useReducer, useState } from "react";
import L from "leaflet";
import { LuX } from "react-icons/lu";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/mapConfig";
import type { FeatureType, LatLng, MapMode } from "@/lib/maps/types";
import {
  canRemoveVertex,
  draftContext,
  initialMapState,
  mapReducer,
} from "@/lib/maps/mapState";
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

const NOTICE_MS = 5000;

export default function MapView({ canEdit }: { canEdit: boolean }) {
  const [state, dispatch] = useReducer(mapReducer, initialMapState);
  const [minimized, setMinimized] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(t);
  }, [notice]);

  const ctx = draftContext(state);
  const mode: MapMode = ctx?.kind ?? "view";
  const drawing = ctx !== null;
  const editing = ctx?.editingId != null;
  const canRemove = canRemoveVertex(ctx);

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

  const changeMode = (next: MapMode) => {
    dispatch({ type: "setMode", mode: next });
    setNotice(null);
  };

  const finish = () => {
    dispatch({ type: "finish" });
    setNotice(null);
  };

  const handleMapClick = (latlng: L.LatLng) =>
    dispatch({ type: "addPoint", point: [latlng.lat, latlng.lng] });

  const select = (type: FeatureType, id: string) =>
    dispatch({ type: "select", selection: { type, id } });

  const handleSave = async (name: string) => {
    if (state.status !== "drawing" && state.status !== "editing") return;
    const { points } = state.draft;
    if (points.length === 0) return;

    setNotice(null);
    try {
      if (state.status === "editing") {
        const { type, id } = state.selection;
        if (type === "marker") {
          const [lat, lng] = points[0];
          await moveMarker.mutateAsync({ id, lat, lng });
        } else {
          await updateRegionGeometry.mutateAsync({ id, points });
        }
      } else if (state.mode === "marker") {
        const [lat, lng] = points[0];
        await createMarker.mutateAsync({ name, lat, lng });
      } else {
        await createRegion.mutateAsync({ name, points });
      }
      dispatch({ type: "finish" });
    } catch (err) {
      setNotice(errorMessage(err, "Não foi possível salvar. Tente novamente."));
    }
  };

  const selected = state.status === "selected" ? state.selection : null;
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
    if (!selected) return;
    try {
      await renameFeature.mutateAsync({ ...selected, name });
    } catch (err) {
      setNotice(errorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteFeature.mutateAsync(selected);
      dispatch({ type: "deselect" });
    } catch (err) {
      setNotice(errorMessage(err));
    }
  };

  const handleEditGeometry = async () => {
    if (!selected) return;
    try {
      const points: LatLng[] = selectedMarker
        ? [selectedMarker.position]
        : (await loadRegionPoints.mutateAsync({ id: selected.id })).points;
      dispatch({ type: "startEditing", selection: selected, points });
      setNotice(null);
    } catch (err) {
      setNotice(errorMessage(err));
    }
  };

  useDrawShortcuts(canEdit && drawing, {
    onUndo: () => dispatch({ type: "undo" }),
    onRedo: () => dispatch({ type: "redo" }),
    onRemoveVertex: () => dispatch({ type: "removeSelectedVertex" }),
    onEscape: finish,
  });

  const hint = drawing
    ? null
    : zoomedOut
      ? "Aproxime o zoom para buscar mais regiões e marcadores."
      : features.truncated
        ? "Há itens demais nesta área e alguns não estão sendo exibidos. Aproxime o zoom para ver todos."
        : null;
  const message = notice ?? hint;

  const toggleMinimized = () => setMinimized((m) => !m);

  return (
    <div className={styles.wrapper}>
      {canEdit && <MapToolbar mode={mode} onChange={changeMode} />}

      {message && (
        <div className={styles.notice} role={notice ? "alert" : "status"}>
          <span>{message}</span>
          {notice && (
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Fechar aviso"
              title="Fechar aviso"
              className={styles.noticeClose}
            >
              <LuX size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
      >
        <BaseLayers />
        <LocateControl onError={setNotice} />
        <ViewportWatcher onChange={onBoundsChange} />
        <ClickHandler
          enabled={state.status === "drawing"}
          onClick={handleMapClick}
        />

        <PersistedLayers
          markers={features.markers}
          regions={features.regions}
          selectedId={selected?.id ?? null}
          hiddenId={ctx?.editingId ?? null}
          dimmed={drawing}
          onSelect={select}
        />

        {ctx && (
          <DraftLayer
            mode={ctx.kind}
            points={ctx.draft.points}
            editing={editing}
            selectedVertex={ctx.draft.selectedVertex}
            onMove={(index, point) =>
              dispatch({ type: "moveVertex", index, point })
            }
            onInsert={(index, point) =>
              dispatch({ type: "insertVertex", index, point })
            }
            onSelect={(index) => dispatch({ type: "selectVertex", index })}
          />
        )}
      </MapContainer>

      {canEdit && ctx && (
        <DrawPanel
          key={`${ctx.kind}-${ctx.editingId ?? "new"}`}
          mode={ctx.kind}
          editing={editing}
          pointCount={ctx.draft.points.length}
          canUndo={ctx.draft.past.length > 0}
          canRedo={ctx.draft.future.length > 0}
          canRemoveVertex={canRemove}
          saving={saving}
          minimized={minimized}
          onToggleMinimized={toggleMinimized}
          onUndo={() => dispatch({ type: "undo" })}
          onRedo={() => dispatch({ type: "redo" })}
          onRemoveVertex={() => dispatch({ type: "removeSelectedVertex" })}
          onCancel={finish}
          onSave={handleSave}
        />
      )}

      {state.status === "selected" && selectedName !== undefined && (
        <FeaturePanel
          key={state.selection.id}
          type={state.selection.type}
          initialName={selectedName}
          canEdit={canEdit}
          minimized={minimized}
          onToggleMinimized={toggleMinimized}
          onClose={() => dispatch({ type: "deselect" })}
          onRename={handleRename}
          onEditGeometry={handleEditGeometry}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
