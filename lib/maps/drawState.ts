import type { LatLng, MapMode } from "./types";

export const MAX_HISTORY = 100;
export const MIN_REGION_VERTICES = 3;

export type DrawState = {
  mode: MapMode;
  editingId: string | null;
  present: LatLng[];
  past: LatLng[][];
  future: LatLng[][];
  selectedVertex: number | null;
};

export type DrawAction =
  | { type: "setMode"; mode: MapMode }
  | { type: "addPoint"; point: LatLng }
  | { type: "insertVertex"; index: number; point: LatLng }
  | { type: "moveVertex"; index: number; point: LatLng }
  | { type: "removeVertex"; index: number }
  | { type: "selectVertex"; index: number | null }
  | {
      type: "load";
      id: string;
      mode: Exclude<MapMode, "view">;
      points: LatLng[];
    }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" };

export const initialDrawState: DrawState = {
  mode: "view",
  editingId: null,
  present: [],
  past: [],
  future: [],
  selectedVertex: null,
};

export function ringToVertices(ring: LatLng[]): LatLng[] {
  const first = ring[0];
  const last = ring[ring.length - 1];
  const closed =
    ring.length > 1 && first[0] === last[0] && first[1] === last[1];
  return closed ? ring.slice(0, -1) : ring;
}

function commit(
  state: DrawState,
  next: LatLng[],
  selectedVertex: number | null,
): DrawState {
  return {
    ...state,
    present: next,
    past: [...state.past, state.present].slice(-MAX_HISTORY),
    future: [],
    selectedVertex,
  };
}

const validIndex = (state: DrawState, index: number) =>
  Number.isInteger(index) && index >= 0 && index < state.present.length;

export function drawReducer(state: DrawState, action: DrawAction): DrawState {
  switch (action.type) {
    case "setMode":
      return { ...initialDrawState, mode: action.mode };

    case "reset":
      return { ...initialDrawState, mode: state.mode };

    case "load":
      return {
        ...initialDrawState,
        mode: action.mode,
        editingId: action.id,
        present: action.points,
      };

    case "addPoint": {
      if (state.mode === "marker") return commit(state, [action.point], 0);
      if (state.mode === "region") {
        return commit(
          state,
          [...state.present, action.point],
          state.present.length,
        );
      }
      return state;
    }

    case "insertVertex": {
      if (state.mode !== "region") return state;
      const index = Math.min(Math.max(action.index, 0), state.present.length);
      const next = [
        ...state.present.slice(0, index),
        action.point,
        ...state.present.slice(index),
      ];
      return commit(state, next, index);
    }

    case "moveVertex": {
      if (state.mode === "view" || !validIndex(state, action.index))
        return state;
      const next = state.present.map((p, i) =>
        i === action.index ? action.point : p,
      );
      return commit(state, next, action.index);
    }

    case "removeVertex": {
      if (state.mode !== "region" || !validIndex(state, action.index))
        return state;
      if (state.editingId && state.present.length - 1 < MIN_REGION_VERTICES) {
        return state;
      }
      const next = state.present.filter((_, i) => i !== action.index);
      return commit(state, next, null);
    }

    case "selectVertex": {
      const index = action.index;
      if (index !== null && !validIndex(state, index)) return state;
      return state.selectedVertex === index
        ? state
        : { ...state, selectedVertex: index };
    }

    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future],
        selectedVertex: null,
      };
    }

    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        ...state,
        present: next,
        past: [...state.past, state.present].slice(-MAX_HISTORY),
        future: rest,
        selectedVertex: null,
      };
    }
  }
}
