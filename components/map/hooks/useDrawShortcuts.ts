"use client";

import { useEffect, useRef } from "react";

type Handlers = {
  onUndo: () => void;
  onRedo: () => void;
  onRemoveVertex: () => void;
  onEscape: () => void;
};

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return (
    !!el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable)
  );
};

export function useDrawShortcuts(enabled: boolean, handlers: Handlers) {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const h = ref.current;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === "z") {
        e.preventDefault();
        (e.shiftKey ? h.onRedo : h.onUndo)();
      } else if (mod && key === "y") {
        e.preventDefault();
        h.onRedo();
      } else if (key === "delete" || key === "backspace") {
        e.preventDefault();
        h.onRemoveVertex();
      } else if (key === "escape") {
        h.onEscape();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
