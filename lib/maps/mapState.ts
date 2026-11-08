import type { FeatureType, LatLng, MapMode } from "./types";

export const MAX_HISTORY = 100;
export const MIN_REGION_VERTICES = 3;

export type Selection = { type: FeatureType; id: string };

export type Draft = {
  points: LatLng[];
  past: LatLng[][];
  future: LatLng[][];
  selectedVertex: number | null;
};

export type MapState =
  | { status: "idle" }
  | { status: "selected"; selection: Selection }
  | { status: "drawing"; mode: FeatureType; draft: Draft }
  | { status: "editing"; selection: Selection; draft: Draft };

export type MapAction =
  | { type: "setMode"; mode: MapMode }
  | { type: "select"; selection: Selection }
  | { type: "deselect" }
  | { type: "startEditing"; selection: Selection; points: LatLng[] }
  | { type: "finish" }
  | { type: "addPoint"; point: LatLng }
  | { type: "insertVertex"; index: number; point: LatLng }
  | { type: "moveVertex"; index: number; point: LatLng }
  | { type: "removeSelectedVertex" }
  | { type: "selectVertex"; index: number | null }
  | { type: "undo" }
  | { type: "redo" };

export const initialMapState: MapState = { status: "idle" };

const EMPTY_DRAFT: Draft = {
  points: [],
  past: [],
  future: [],
  selectedVertex: null,
};

type DraftState = Extract<MapState, { status: "drawing" | "editing" }>;

const isDraftState = (state: MapState): state is DraftState =>
  state.status === "drawing" || state.status === "editing";

export type DraftContext = {
  kind: FeatureType;
  editingId: string | null;
  draft: Draft;
};

function toContext(state: DraftState): DraftContext {
  return state.status === "drawing"
    ? { kind: state.mode, editingId: null, draft: state.draft }
    : {
        kind: state.selection.type,
        editingId: state.selection.id,
        draft: state.draft,
      };
}

export const draftContext = (state: MapState): DraftContext | null =>
  isDraftState(state) ? toContext(state) : null;

export const canRemoveVertex = (ctx: DraftContext | null) =>
  ctx !== null &&
  ctx.kind === "region" &&
  ctx.draft.selectedVertex !== null &&
  (ctx.editingId === null || ctx.draft.points.length > MIN_REGION_VERTICES);

function commit(
  draft: Draft,
  points: LatLng[],
  selectedVertex: number | null,
): Draft {
  return {
    points,
    past: [...draft.past, draft.points].slice(-MAX_HISTORY),
    future: [],
    selectedVertex,
  };
}

const validIndex = (draft: Draft, index: number) =>
  Number.isInteger(index) && index >= 0 && index < draft.points.length;

function reduceDraft(ctx: DraftContext, action: MapAction): Draft {
  const { draft, kind, editingId } = ctx;

  switch (action.type) {
    case "addPoint": {
      if (editingId !== null) return draft;
      return kind === "marker"
        ? commit(draft, [action.point], 0)
        : commit(draft, [...draft.points, action.point], draft.points.length);
    }

    case "insertVertex": {
      if (kind !== "region") return draft;
      const index = Math.min(Math.max(action.index, 0), draft.points.length);
      const points = [
        ...draft.points.slice(0, index),
        action.point,
        ...draft.points.slice(index),
      ];
      return commit(draft, points, index);
    }

    case "moveVertex": {
      if (!validIndex(draft, action.index)) return draft;
      const points = draft.points.map((p, i) =>
        i === action.index ? action.point : p,
      );
      return commit(draft, points, action.index);
    }

    case "removeSelectedVertex": {
      const index = draft.selectedVertex;
      if (index === null || !canRemoveVertex(ctx) || !validIndex(draft, index))
        return draft;
      return commit(
        draft,
        draft.points.filter((_, i) => i !== index),
        null,
      );
    }

    case "selectVertex": {
      const { index } = action;
      if (index !== null && !validIndex(draft, index)) return draft;
      return draft.selectedVertex === index
        ? draft
        : { ...draft, selectedVertex: index };
    }

    case "undo": {
      if (draft.past.length === 0) return draft;
      return {
        points: draft.past[draft.past.length - 1],
        past: draft.past.slice(0, -1),
        future: [draft.points, ...draft.future],
        selectedVertex: null,
      };
    }

    case "redo": {
      const [next, ...rest] = draft.future;
      if (!next) return draft;
      return {
        points: next,
        past: [...draft.past, draft.points].slice(-MAX_HISTORY),
        future: rest,
        selectedVertex: null,
      };
    }

    default:
      return draft;
  }
}

export function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "setMode":
      return action.mode === "view"
        ? initialMapState
        : { status: "drawing", mode: action.mode, draft: EMPTY_DRAFT };

    case "select":
      return state.status === "idle" || state.status === "selected"
        ? { status: "selected", selection: action.selection }
        : state;

    case "deselect":
      return state.status === "selected" ? initialMapState : state;

    case "startEditing": {
      if (
        state.status !== "selected" ||
        state.selection.id !== action.selection.id
      )
        return state;
      return {
        status: "editing",
        selection: state.selection,
        draft: { ...EMPTY_DRAFT, points: action.points },
      };
    }

    case "finish":
      if (state.status === "drawing") return initialMapState;
      if (state.status === "editing")
        return { status: "selected", selection: state.selection };
      return state;

    default: {
      if (!isDraftState(state)) return state;
      const ctx = toContext(state);
      const draft = reduceDraft(ctx, action);
      return draft === ctx.draft ? state : { ...state, draft };
    }
  }
}
