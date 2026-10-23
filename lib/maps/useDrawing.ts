"use client";

import { useMemo, useReducer } from "react";
import { drawReducer, initialDrawState } from "./drawState";
import type { LatLng, MapMode } from "./types";

export function useDrawing() {
  const [state, dispatch] = useReducer(drawReducer, initialDrawState);

  const actions = useMemo(
    () => ({
      setMode: (mode: MapMode) => dispatch({ type: "setMode", mode }),
      addPoint: (point: LatLng) => dispatch({ type: "addPoint", point }),
      undo: () => dispatch({ type: "undo" }),
      reset: () => dispatch({ type: "reset" }),

      redo: () => dispatch({ type: "redo" }),
      insertVertex: (index: number, point: LatLng) =>
        dispatch({ type: "insertVertex", index, point }),
      moveVertex: (index: number, point: LatLng) =>
        dispatch({ type: "moveVertex", index, point }),
      removeVertex: (index: number) =>
        dispatch({ type: "removeVertex", index }),
      selectVertex: (index: number | null) =>
        dispatch({ type: "selectVertex", index }),
      startEditing: (
        id: string,
        mode: Exclude<MapMode, "view">,
        points: LatLng[],
      ) => dispatch({ type: "load", id, mode, points }),
    }),
    [],
  );

  return {
    state,
    actions,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
