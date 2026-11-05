"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import styles from "@/components/map/map.module.css";

type PanelShellProps = {
  title: string;
  summary?: ReactNode;
  compactActions?: ReactNode;
  headerActions?: ReactNode;
  minimized: boolean;
  onToggleMinimized: () => void;
  children: ReactNode;
};

export function PanelShell({
  title,
  summary,
  compactActions,
  headerActions,
  minimized,
  onToggleMinimized,
  children,
}: PanelShellProps) {
  const toggleLabel = minimized ? "Expandir painel" : "Minimizar painel";

  return (
    <div
      className={clsx(styles.panel, minimized && styles.panelMin)}
      role="region"
      aria-label={title}
    >
      <div className={styles.panelBar}>
        <h2 className={styles.panelTitle}>{title}</h2>
        {minimized && <span className={styles.summary}>{summary}</span>}
        {minimized && compactActions}
        {headerActions}
        <button
          type="button"
          onClick={onToggleMinimized}
          aria-expanded={!minimized}
          aria-label={toggleLabel}
          title={toggleLabel}
          className={styles.closeBtn}
        >
          {minimized ? <LuChevronUp size={18} /> : <LuChevronDown size={18} />}
        </button>
      </div>

      {!minimized && <div className={styles.panelBody}>{children}</div>}
    </div>
  );
}
