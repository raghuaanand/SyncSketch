// Shared by the API (validation) and the UI (labels).
export const BOARD_KINDS = ["SKETCH", "WHITEBOARD"] as const;

export type BoardKind = (typeof BOARD_KINDS)[number];

export const BOARD_KIND_META: Record<BoardKind, { label: string; description: string }> = {
  SKETCH: {
    label: "Excalidraw",
    description: "Hand-drawn sketches and diagrams on an infinite canvas.",
  },
  WHITEBOARD: {
    label: "Whiteboard",
    description: "A Miro-style canvas with sticky notes, frames, text, arrows and images.",
  },
};
