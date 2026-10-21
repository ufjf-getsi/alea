"use client";

import { useCallback, useEffect, useRef } from "react";
import type L from "leaflet";
import { getMapDataInBounds } from "@/actions/maps/mapActions";
import type { MapData } from "@/lib/maps/types";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function useViewportData(
  onData: (data: MapData) => void,
  debounceMs = 300,
  margin = 0.2,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onBoundsChange = useCallback(
    (bounds: L.LatLngBounds) => {
      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(async () => {
        const latPad = (bounds.getNorth() - bounds.getSouth()) * margin;
        const lngPad = (bounds.getEast() - bounds.getWest()) * margin;

        try {
          const res = await getMapDataInBounds({
            minLat: clamp(bounds.getSouth() - latPad, -90, 90),
            maxLat: clamp(bounds.getNorth() + latPad, -90, 90),
            minLng: clamp(bounds.getWest() - lngPad, -180, 180),
            maxLng: clamp(bounds.getEast() + lngPad, -180, 180),
          });
          if (res.ok) onData(res.data);
        } catch (err) {
          console.error("Erro ao carregar dados do mapa:", err);
        }
      }, debounceMs);
    },
    [onData, debounceMs, margin],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return onBoundsChange;
}
