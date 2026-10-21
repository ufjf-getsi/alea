"use client";

import { useEffect, useState } from "react";
import type L from "leaflet";
import { CircleMarker, useMap, useMapEvents } from "react-leaflet";

export function ViewportWatcher({
  onChange,
}: {
  onChange: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMapEvents({
    moveend: () => onChange(map.getBounds()),
  });

  useEffect(() => {
    onChange(map.getBounds());
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

export function UserLocation() {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLngTuple | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng: L.LatLngTuple = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(latlng);
        map.setView(latlng, 15);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [map]);

  if (!position) return null;

  return (
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
  );
}
