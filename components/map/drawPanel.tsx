"use client";

import { useState } from "react";
import clsx from "clsx";
import styles from "@/components/map/map.module.css";

type DrawPanelProps = {
  mode: "marker" | "region";
  pointCount: number;
  saving: boolean;
  error: string | null;
  onUndo: () => void;
  onCancel: () => void;
  onSave: (name: string) => void;
};

export function DrawPanel({
  mode,
  pointCount,
  saving,
  error,
  onUndo,
  onCancel,
  onSave,
}: DrawPanelProps) {
  const [name, setName] = useState("");

  const minPoints = mode === "marker" ? 1 : 3;
  const ready = pointCount >= minPoints && name.trim().length > 0 && !saving;

  const hint =
    mode === "marker"
      ? pointCount
        ? "Clique em outro ponto para mover o marcador."
        : "Clique no mapa para posicionar o marcador."
      : pointCount < 3
        ? `Clique no mapa para adicionar vértices (${pointCount}/3 mínimos).`
        : `${pointCount} vértices. Continue clicando ou salve o polígono.`;

  return (
    <div className={styles.panel}>
      <p className={styles.hint}>{hint}</p>

      <input
        type="text"
        value={name}
        maxLength={100}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && ready && onSave(name.trim())}
        placeholder={mode === "marker" ? "Nome do marcador" : "Nome da região"}
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        {mode === "region" ? (
          <button
            type="button"
            onClick={onUndo}
            disabled={pointCount === 0 || saving}
            className={clsx(styles.btn, styles.btnSecondary)}
          >
            Desfazer ponto
          </button>
        ) : (
          <span />
        )}

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
    </div>
  );
}
