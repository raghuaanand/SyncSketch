"use client";

import "@excalidraw/excalidraw/index.css";
import { Excalidraw, MainMenu, serializeAsJSON } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { MoveLeftIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import type { Board, BoardData } from "@/lib/api-client";
import { SaveStatusPill } from "./save-status";
import { useBoardSession } from "./use-board-session";

export default function ExcalidrawEditor({ board }: { board: Board }) {
  const { isDarkMode, setTheme } = useTheme();
  const [excalidraw, setExcalidraw] = useState<ExcalidrawImperativeAPI>();

  // serializeAsJSON drops volatile app state (collaborators, dialogs, ...)
  // and deleted images, so only durable scene data is stored.
  const read = useCallback((): BoardData | null => {
    if (!excalidraw) return null;
    const json = serializeAsJSON(
      excalidraw.getSceneElements(),
      excalidraw.getAppState(),
      excalidraw.getFiles(),
      "local",
    );
    const { elements, appState, files } = JSON.parse(json);
    return { elements, appState, files: files ?? {} };
  }, [excalidraw]);

  const { status, error, schedule, goBack } = useBoardSession(board, read);

  return (
    <div className="h-screen bg-background">
      <Excalidraw
        onChange={schedule}
        theme={isDarkMode ? "dark" : "light"}
        excalidrawAPI={setExcalidraw}
        initialData={board.data ? (board.data as never) : undefined}
      >
        <MainMenu>
          <MainMenu.Item icon={<MoveLeftIcon />} onSelect={goBack}>
            Back to boards
          </MainMenu.Item>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme onSelect={(theme) => setTheme(theme)} />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
      <SaveStatusPill status={status} boardName={board.name} error={error} />
    </div>
  );
}
