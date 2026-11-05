import type { FeatureType } from "./types";

export type Selection = { type: FeatureType; id: string };

export type UiState = {
  selected: Selection | null;
  minimized: boolean;
  error: string | null;
};

export type UiAction =
  | { type: "select"; selection: Selection }
  | { type: "deselect" }
  | { type: "setError"; error: string | null }
  | { type: "toggleMinimized" }
  | { type: "modeChanged" };

export const initialUiState: UiState = {
  selected: null,
  minimized: false,
  error: null,
};

export function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.selection, error: null };

    case "deselect":
      return state.selected ? { ...state, selected: null } : state;

    case "setError":
      return state.error === action.error
        ? state
        : { ...state, error: action.error };

    case "toggleMinimized":
      return { ...state, minimized: !state.minimized };

    case "modeChanged":
      return { ...state, selected: null, error: null };
  }
}
