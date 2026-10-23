"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type L from "leaflet";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import type { MapData } from "./types";
import { tileId, tilesForBounds, type Tile } from "./tiles";
import {
  EMPTY_VIEW_DATA,
  toViewData,
  type ViewData,
  type ViewMarker,
  type ViewRegion,
} from "./viewModel";

const TILE_ZOOM_OFFSET = 2;
const DEBOUNCE_MS = 300;
const STALE_MS = 30_000;
const REFRESH_MS = 60_000;
const GC_MS = 5 * 60_000;

export const mapKeys = {
  tiles: ["map", "tiles"] as const,
  tile: ({ z, x, y }: Tile) => ["map", "tiles", z, x, y] as const,
};

async function fetchTile(tile: Tile, signal: AbortSignal): Promise<ViewData> {
  const { z, x, y } = tile;
  const res = await fetch(`/api/maps/features?z=${z}&x=${x}&y=${y}`, {
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return toViewData((await res.json()) as MapData);
}

type Merged = ViewData & { pending: boolean };

function mergeTiles(results: UseQueryResult<ViewData, Error>[]): Merged {
  const markers = new Map<string, ViewMarker>();
  const regions = new Map<string, ViewRegion>();
  let pending = false;
  let truncated = false;

  for (const r of results) {
    if (r.isPending) {
      pending = true;
      continue;
    }
    if (!r.data) continue;
    truncated ||= r.data.truncated;
    r.data.markers.forEach((m) => markers.set(m.id, m));
    r.data.regions.forEach((x) => regions.set(x.id, x));
  }

  return {
    markers: [...markers.values()],
    regions: [...regions.values()],
    truncated,
    pending,
  };
}

const sameItems = <T,>(a: T[], b: T[]) =>
  a.length === b.length && a.every((item, i) => item === b[i]);

const sameView = (a: ViewData, b: ViewData) =>
  a.truncated === b.truncated &&
  sameItems(a.markers, b.markers) &&
  sameItems(a.regions, b.regions);

const sameTiles = (a: Tile[], b: Tile[]) =>
  a.length === b.length && a.every((t, i) => tileId(t) === tileId(b[i]));

export function useMapFeatures() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const merged = useQueries({
    queries: tiles.map((tile) => ({
      queryKey: mapKeys.tile(tile),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchTile(tile, signal),
      staleTime: STALE_MS,
      gcTime: GC_MS,
      refetchInterval: REFRESH_MS,
    })),
    combine: mergeTiles,
  });

  const [features, setFeatures] = useState<ViewData>(EMPTY_VIEW_DATA);
  if (!merged.pending && !sameView(features, merged)) {
    setFeatures({
      markers: merged.markers,
      regions: merged.regions,
      truncated: merged.truncated,
    });
  }

  // Estável: o ViewportWatcher a usa como dependência de efeito.
  const onBoundsChange = useCallback((bounds: L.LatLngBounds, zoom: number) => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const next = tilesForBounds(
        {
          minLat: bounds.getSouth(),
          minLng: bounds.getWest(),
          maxLat: bounds.getNorth(),
          maxLng: bounds.getEast(),
        },
        Math.max(0, Math.floor(zoom) - TILE_ZOOM_OFFSET),
      );
      setTiles((prev) => (sameTiles(prev, next) ? prev : next));
    }, DEBOUNCE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { features, onBoundsChange };
}
