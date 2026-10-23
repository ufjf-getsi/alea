"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMarker as createMarkerAction,
  createRegion as createRegionAction,
  deleteFeature as deleteFeatureAction,
  renameFeature as renameFeatureAction,
} from "@/actions/maps/mapActions";
import type {
  CreateMarkerInput,
  CreateRegionInput,
  DeleteFeatureInput,
  RenameFeatureInput,
} from "@/lib/validations/map";
import type { ActionResult } from "./types";
import { mapKeys } from "./useMapFeatures";
import type { ViewData } from "./viewModel";

class ActionError extends Error {}

export const errorMessage = (
  err: unknown,
  fallback = "Não foi possível concluir a operação. Tente novamente.",
) => (err instanceof ActionError ? err.message : fallback);

async function unwrap<T>(promise: Promise<ActionResult<T>>) {
  const res = await promise;
  if (!res.ok) throw new ActionError(res.error);
  return res.data;
}

export function useMapMutations() {
  const qc = useQueryClient();

  const patch = (fn: (d: ViewData) => ViewData) =>
    qc.setQueriesData<ViewData>({ queryKey: mapKeys.tiles }, (d) => d && fn(d));

  const invalidate = () => qc.invalidateQueries({ queryKey: mapKeys.tiles });

  const createMarker = useMutation({
    mutationFn: (input: CreateMarkerInput) => unwrap(createMarkerAction(input)),
    onSuccess: invalidate,
  });

  const createRegion = useMutation({
    mutationFn: (input: CreateRegionInput) => unwrap(createRegionAction(input)),
    onSuccess: invalidate,
  });

  const renameFeature = useMutation({
    mutationFn: (input: RenameFeatureInput) =>
      unwrap(renameFeatureAction(input)),
    onSuccess: (_data, { id, name }) => {
      patch((d) => ({
        ...d,
        markers: d.markers.map((m) => (m.id === id ? { ...m, name } : m)),
        regions: d.regions.map((r) => (r.id === id ? { ...r, name } : r)),
      }));
      void invalidate();
    },
  });

  const deleteFeature = useMutation({
    mutationFn: (input: DeleteFeatureInput) =>
      unwrap(deleteFeatureAction(input)),
    onSuccess: (_data, { id }) => {
      patch((d) => ({
        ...d,
        markers: d.markers.filter((m) => m.id !== id),
        regions: d.regions.filter((r) => r.id !== id),
      }));
      void invalidate();
    },
  });

  return { createMarker, createRegion, renameFeature, deleteFeature };
}
