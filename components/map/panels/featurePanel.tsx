"use client";

import { useState } from "react";
import clsx from "clsx";
import { LuX } from "react-icons/lu";
import type { FeatureType } from "@/lib/maps/types";
import { PanelShell } from "@/components/map/panels/panelShell";
import styles from "@/components/map/map.module.css";

type FeaturePanelProps = {
  type: FeatureType;
  initialName: string;
  canEdit: boolean;
  minimized: boolean;
  onToggleMinimized: () => void;
  onClose: () => void;
  onRename: (name: string) => Promise<void>;
  onEditGeometry: () => Promise<void>;
  onDelete: () => Promise<void>;
};

export function FeaturePanel({
  type,
  initialName,
  canEdit,
  minimized,
  onToggleMinimized,
  onClose,
  onRename,
  onEditGeometry,
  onDelete,
}: FeaturePanelProps) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const label = type === "marker" ? "Marcador" : "Região";
  const trimmed = name.trim();
  const changed = trimmed.length > 0 && trimmed !== initialName.trim();

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <PanelShell
      title={label}
      minimized={minimized}
      onToggleMinimized={onToggleMinimized}
      summary={initialName}
      headerActions={
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className={styles.closeBtn}
        >
          <LuX size={18} />
        </button>
      }
    >
      <input
        type="text"
        value={name}
        maxLength={100}
        readOnly={!canEdit}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" &&
          canEdit &&
          changed &&
          !busy &&
          run(() => onRename(trimmed))
        }
        className={styles.input}
      />

      <button
        type="button"
        disabled
        title="Preencher formulário"
        className={clsx(styles.btn, styles.btnFuture)}
      >
        Preencher formulário
      </button>

      {canEdit && (
        <button
          type="button"
          onClick={() => run(onEditGeometry)}
          disabled={busy}
          className={clsx(styles.btn, styles.btnSecondary)}
        >
          {busy && !confirming
            ? "Carregando…"
            : type === "marker"
              ? "Mover marcador"
              : "Editar vértices"}
        </button>
      )}

      {canEdit && (
        <div className={styles.actions}>
          {confirming ? (
            <div className={styles.actionGroup}>
              <button
                type="button"
                onClick={() => run(onDelete)}
                disabled={busy}
                className={clsx(styles.btn, styles.btnDanger)}
              >
                {busy ? "Excluindo…" : "Confirmar exclusão"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={busy}
                className={clsx(styles.btn, styles.btnSecondary)}
              >
                Voltar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={busy}
              className={clsx(styles.btn, styles.btnDangerSoft)}
            >
              Excluir
            </button>
          )}

          <button
            type="button"
            onClick={() => run(() => onRename(trimmed))}
            disabled={busy || !changed}
            className={clsx(styles.btn, styles.btnPrimary)}
          >
            {busy && !confirming ? "Salvando…" : "Salvar nome"}
          </button>
        </div>
      )}
    </PanelShell>
  );
}
