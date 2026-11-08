"use client";

import { useState } from "react";
import type L from "leaflet";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { BBox, MapData } from "@/lib/maps/types";
import { mapKeys } from "@/lib/maps/queryKeys";
import { MIN_FETCH_ZOOM } from "@/lib/maps/mapConfig";

const EMPTY: MapData = { markers: [], regions: [], truncated: false };

const clamp = (v: number, limit: number) =>
  Math.min(limit, Math.max(-limit, v));

function snapBounds(bounds: L.LatLngBounds, zoom: number): BBox {
  const step = 360 / 2 ** zoom;
  const snap = (v: number, round: (n: number) => number, limit: number) =>
    Number(clamp(round(v / step) * step, limit).toFixed(6));

  return {
    minLat: snap(bounds.getSouth(), Math.floor, 90),
    minLng: snap(bounds.getWest(), Math.floor, 180),
    maxLat: snap(bounds.getNorth(), Math.ceil, 90),
    maxLng: snap(bounds.getEast(), Math.ceil, 180),
  };
}

const sameBBox = (a: BBox, b: BBox) =>
  a.minLat === b.minLat &&
  a.minLng === b.minLng &&
  a.maxLat === b.maxLat &&
  a.maxLng === b.maxLng;

async function fetchFeatures(
  bbox: BBox,
  signal: AbortSignal,
): Promise<MapData> {
  const params = new URLSearchParams({
    minLat: String(bbox.minLat),
    minLng: String(bbox.minLng),
    maxLat: String(bbox.maxLat),
    maxLng: String(bbox.maxLng),
  });
  const res = await fetch(`/api/maps/features?${params}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as MapData;
}

export function useMapFeatures() {
  const [bbox, setBbox] = useState<BBox | null>(null);
  const [zoomedOut, setZoomedOut] = useState(false);

  const onBoundsChange = (bounds: L.LatLngBounds, zoom: number) => {
    const z = Math.floor(zoom);

    if (z < MIN_FETCH_ZOOM) {
      setZoomedOut(true);
      return;
    }

    setZoomedOut(false);
    const next = snapBounds(bounds, z);
    setBbox((prev) => (prev && sameBBox(prev, next) ? prev : next));
  };

  const { data = EMPTY } = useQuery({
    queryKey: mapKeys.bbox(bbox),
    queryFn: ({ signal }) => fetchFeatures(bbox!, signal),
    enabled: bbox !== null && !zoomedOut,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });

  return { features: data, onBoundsChange, zoomedOut };
}
