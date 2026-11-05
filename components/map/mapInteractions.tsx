"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { CircleMarker, useMap, useMapEvents } from "react-leaflet";
import styles from "@/components/map/map.module.css";

const LOCATE_ZOOM = 15;

export function ViewportWatcher({
  onChange,
}: {
  onChange: (bounds: L.LatLngBounds, zoom: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => onChange(map.getBounds(), map.getZoom()),
  });

  useEffect(() => {
    onChange(map.getBounds(), map.getZoom());
  }, [map, onChange]);

  return null;
}

export function ClickHandler({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: (latlng: L.LatLng) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    el.style.cursor = enabled ? "crosshair" : "";
    return () => {
      el.style.cursor = "";
    };
  }, [enabled, map]);

  useMapEvents({
    click: (e) => {
      if (enabled) onClick(e.latlng.wrap());
    },
  });

  return null;
}

export function LocateControl({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const map = useMap();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<L.LatLngTuple | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const control = new L.Control({ position: "bottomright" });

    control.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar");
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      setContainer(div);
      return div;
    };

    control.addTo(map);
    return () => {
      control.remove();
      setContainer(null);
    };
  }, [map]);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      onError("Seu navegador não suporta geolocalização.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng: L.LatLngTuple = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(latlng);
        map.setView(latlng, LOCATE_ZOOM);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        onError(
          err.code === err.PERMISSION_DENIED
            ? "Permissão de localização negada."
            : "Não foi possível obter sua localização.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  return (
    <>
      {container &&
        createPortal(
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            aria-label="Minha localização"
            title="Minha localização"
            className={styles.locateBtn}
          >
            <LuLocateFixed size={26} aria-hidden="true" />
          </button>,
          container,
        )}

      {position && (
        <CircleMarker
          center={position}
          radius={8}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#2563eb",
            fillOpacity: 1,
            interactive: false,
          }}
        />
      )}
    </>
  );
}
