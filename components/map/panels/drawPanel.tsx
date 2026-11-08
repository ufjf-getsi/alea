"use client";

import { useState } from "react";
import clsx from "clsx";
import { LuRedo2, LuUndo2 } from "react-icons/lu";
import { PanelShell } from "@/components/map/panels/panelShell";
import styles from "@/components/map/map.module.css";

type DrawPanelProps = {
  mode: "marker" | "region";
  editing: boolean;
  pointCount: number;
  canUndo: boolean;
  canRedo: boolean;
  canRemoveVertex: boolean;
  saving: boolean;
  minimized: boolean;
  onToggleMinimized: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRemoveVertex: () => void;
  onCancel: () => void;
  onSave: (name: string) => void;
};

export function DrawPanel({
  mode,
  editing,
  pointCount,
  canUndo,
  canRedo,
  canRemoveVertex,
  saving,
  minimized,
  onToggleMinimized,
  onUndo,
  onRedo,
  onRemoveVertex,
  onCancel,
  onSave,
}: DrawPanelProps) {
  const [name, setName] = useState("");

  const isRegion = mode === "region";
  const hasGeometry = pointCount >= (isRegion ? 3 : 1);
  const nameOk = editing || name.trim().length > 0;
  const canSave = hasGeometry && (!editing || canUndo) && !saving;
  const ready = canSave && nameOk;

  const title = editing
    ? isRegion
      ? "Editar região"
      : "Mover marcador"
    : isRegion
      ? "Nova região"
      : "Novo marcador";

  const hint = editing
    ? isRegion
      ? "Arraste os vértices. Clique num ponto intermediário para criar um vértice novo."
      : "Arraste o marcador para a nova posição."
    : isRegion
      ? pointCount < 3
        ? `Clique no mapa para adicionar vértices (${pointCount}/3 mínimos).`
        : `${pointCount} vértices. Continue clicando ou salve o polígono.`
      : pointCount
        ? "Arraste o marcador ou clique em outro ponto para movê-lo."
        : "Clique no mapa para posicionar o marcador.";

  const summaryText = isRegion
    ? `${pointCount} ${pointCount === 1 ? "vértice" : "vértices"}`
    : pointCount
      ? "Posicionado"
      : "Sem posição";

  const saveFromBar = () =>
    nameOk ? onSave(name.trim()) : onToggleMinimized();

  return (
    <PanelShell
      title={title}
      minimized={minimized}
      onToggleMinimized={onToggleMinimized}
      summary={summaryText}
      compactActions={
        <>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || saving}
            aria-label="Desfazer"
            title="Desfazer (Ctrl+Z)"
            className={styles.closeBtn}
          >
            <LuUndo2 size={16} />
          </button>
          <button
            type="button"
            onClick={saveFromBar}
            disabled={!canSave}
            className={clsx(styles.btn, styles.btnSm, styles.btnPrimary)}
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </>
      }
    >
      <p className={styles.hint}>{hint}</p>

      {!editing && (
        <input
          type="text"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ready && onSave(name.trim())}
          placeholder={isRegion ? "Nome da região" : "Nome do marcador"}
          className={styles.input}
        />
      )}

      <div className={styles.actions}>
        <div className={styles.actionGroup}>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || saving}
            aria-label="Desfazer"
            title="Desfazer (Ctrl+Z)"
            className={clsx(styles.btn, styles.btnSm, styles.btnSecondary)}
          >
            <LuUndo2 size={16} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo || saving}
            aria-label="Refazer"
            title="Refazer (Ctrl+Shift+Z)"
            className={clsx(styles.btn, styles.btnSm, styles.btnSecondary)}
          >
            <LuRedo2 size={16} />
          </button>
        </div>

        {isRegion && (
          <button
            type="button"
            onClick={onRemoveVertex}
            disabled={!canRemoveVertex || saving}
            title="Selecione um vértice e pressione Delete"
            className={clsx(styles.btn, styles.btnSm, styles.btnDangerSoft)}
          >
            Remover vértice
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <span />
        <div className={styles.actionGroup}>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className={clsx(styles.btn, styles.btnSecondary)}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(name.trim())}
            disabled={!ready}
            className={clsx(styles.btn, styles.btnPrimary)}
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </PanelShell>
  );
}
