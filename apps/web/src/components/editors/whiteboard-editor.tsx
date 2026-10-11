"use client";

import "tldraw/tldraw.css";
import {
  DefaultMainMenu,
  DefaultMainMenuContent,
  getSnapshot,
  loadSnapshot,
  Tldraw,
  TldrawUiMenuItem,
  type Editor,
  type TLComponents,
  type TLEditorSnapshot,
} from "tldraw";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import type { Board, BoardData } from "@/lib/api-client";
import { SaveStatusPill } from "./save-status";
import { useBoardSession } from "./use-board-session";

export default function WhiteboardEditor({ board }: { board: Board }) {
  const { isDarkMode } = useTheme();
  const editorRef = useRef<Editor>();
  const colorScheme: "dark" | "light" = isDarkMode ? "dark" : "light";
  const colorSchemeRef = useRef(colorScheme);
  colorSchemeRef.current = colorScheme;

  const read = useCallback((): BoardData | null => {
    const editor = editorRef.current;
    return editor ? (getSnapshot(editor.store) as unknown as BoardData) : null;
  }, []);

  const { status, error, schedule, goBack } = useBoardSession(board, read);

  const components = useMemo<TLComponents>(
    () => ({
      MainMenu: () => (
        <DefaultMainMenu>
          <TldrawUiMenuItem id="back" label="Back to boards" icon="arrow-left" onSelect={goBack} />
          <DefaultMainMenuContent />
        </DefaultMainMenu>
      ),
    }),
    [goBack],
  );

  const onMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      editor.user.updateUserPreferences({ colorScheme: colorSchemeRef.current });
      if (board.data) loadSnapshot(editor.store, board.data as unknown as TLEditorSnapshot);
      return editor.store.listen(schedule, { source: "user", scope: "document" });
    },
    [board.data, schedule],
  );

  // The editor lives under the app's theme.
  useEffect(() => {
    editorRef.current?.user.updateUserPreferences({ colorScheme });
  }, [colorScheme]);

  return (
    <div className="fixed inset-0 bg-background">
      <Tldraw
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
        components={components}
        onMount={onMount}
      />
      <SaveStatusPill status={status} boardName={board.name} error={error} />
    </div>
  );
}
