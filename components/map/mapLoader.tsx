"use client";

import dynamic from "next/dynamic";
import styles from "./map.module.css";

/**
 * Leaflet relies on browser objects like 'window' and 'document',
 * which are not available during SSR. Therefore, the map must
 * be rendered only on the client.
 */
const MapView = dynamic(() => import("./mapView"), {
  ssr: false,
  loading: () => <div className={styles.loading}>Carregando mapa…</div>,
});

export function MapLoader({ canEdit }: { canEdit: boolean }) {
  return <MapView canEdit={canEdit} />;
}
