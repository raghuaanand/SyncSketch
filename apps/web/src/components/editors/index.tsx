"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { Board } from "@/lib/api-client";
import type { BoardKind } from "@/lib/board-kinds";
import { ScreenMessage } from "./screen-message";

// Editors are heavy and browser-only: each is its own client-side chunk.
const loaders: Record<BoardKind, () => Promise<{ default: ComponentType<{ board: Board }> }>> = {
  SKETCH: () => import("./excalidraw-editor"),
  WHITEBOARD: () => import("./whiteboard-editor"),
};

const editors = Object.fromEntries(
  Object.entries(loaders).map(([kind, load]) => [
    kind,
    dynamic(load, { ssr: false, loading: () => <ScreenMessage pulse>Opening your board</ScreenMessage> }),
  ]),
) as Record<BoardKind, ComponentType<{ board: Board }>>;

// Start downloading an editor before it is needed (e.g. on hover).
export const preloadEditor = (kind: BoardKind) => void loaders[kind]();

export function BoardEditor({ board }: { board: Board }) {
  const Editor = editors[board.kind];
  return <Editor board={board} />;
}
