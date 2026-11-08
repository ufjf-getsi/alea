"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMarker as createMarkerAction,
  createRegion as createRegionAction,
  deleteFeature as deleteFeatureAction,
  getRegionPoints as getRegionPointsAction,
  moveMarker as moveMarkerAction,
  renameFeature as renameFeatureAction,
  updateRegionGeometry as updateRegionGeometryAction,
} from "@/actions/maps/mapActions";
import type { RegionIdInput } from "@/lib/validations/maps";
import type { ActionResult } from "@/lib/maps/types";
import { mapKeys } from "@/lib/maps/queryKeys";

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

function useFeatureMutation<I, O>(
  action: (input: I) => Promise<ActionResult<O>>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: I) => unwrap(action(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: mapKeys.features }),
  });
}

export function useMapMutations() {
  return {
    createMarker: useFeatureMutation(createMarkerAction),
    createRegion: useFeatureMutation(createRegionAction),
    renameFeature: useFeatureMutation(renameFeatureAction),
    deleteFeature: useFeatureMutation(deleteFeatureAction),
    moveMarker: useFeatureMutation(moveMarkerAction),
    updateRegionGeometry: useFeatureMutation(updateRegionGeometryAction),
    loadRegionPoints: useMutation({
      mutationFn: (input: RegionIdInput) =>
        unwrap(getRegionPointsAction(input)),
    }),
  };
}
