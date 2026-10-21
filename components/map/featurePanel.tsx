"use client";

import { useState } from "react";
import clsx from "clsx";
import { LuX } from "react-icons/lu";
import type { FeatureType } from "@/lib/maps/types";
import styles from "@/components/map/map.module.css";

type FeaturePanelProps = {
  type: FeatureType;
  initialName: string;
  canEdit: boolean;
  onClose: () => void;
  onRename: (name: string) => Promise<string | null>;
  onDelete: () => Promise<string | null>;
};

export function FeaturePanel({
  type,
  initialName,
  canEdit,
  onClose,
  onRename,
  onDelete,
}: FeaturePanelProps) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = type === "marker" ? "Marcador" : "Região";
  const trimmed = name.trim();

  const run = async (action: () => Promise<string | null>) => {
    setBusy(true);
    setError(null);
    const err = await action();
    if (err) setError(err);
    setBusy(false);
    setConfirming(false);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{label}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className={styles.closeBtn}
        >
          <LuX size={18} />
        </button>
      </div>

      <input
        type="text"
        value={name}
        maxLength={100}
        readOnly={!canEdit}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" &&
          canEdit &&
          trimmed &&
          run(() => onRename(trimmed))
        }
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="button"
        disabled
        title="Preencher formulário"
        className={clsx(styles.btn, styles.btnFuture)}
      >
        Preencher formulário
      </button>

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
            disabled={busy || !trimmed || trimmed === initialName.trim()}
            className={clsx(styles.btn, styles.btnPrimary)}
          >
            {busy && !confirming ? "Salvando…" : "Salvar nome"}
          </button>
        </div>
      )}
    </div>
  );
}
