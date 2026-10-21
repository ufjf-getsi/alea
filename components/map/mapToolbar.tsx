"use client";

import clsx from "clsx";
import { LuMapPin, LuMousePointer2, LuPentagon } from "react-icons/lu";
import type { MapMode } from "@/lib/maps/types";
import styles from "@/components/map/map.module.css";

const TOOLS = [
  { mode: "view", label: "Navegar", Icon: LuMousePointer2 },
  { mode: "region", label: "Polígono", Icon: LuPentagon },
  { mode: "marker", label: "Marcador", Icon: LuMapPin },
] as const;

export function MapToolbar({
  mode,
  onChange,
}: {
  mode: MapMode;
  onChange: (mode: MapMode) => void;
}) {
  return (
    <div className={styles.toolbar}>
      {TOOLS.map(({ mode: value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={clsx(styles.tool, mode === value && styles.toolActive)}
        >
          <Icon size={16} aria-hidden="true" />
          <span className={styles.toolLabel}>{label}</span>
        </button>
      ))}
    </div>
  );
}
