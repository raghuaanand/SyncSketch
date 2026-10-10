"use client";

import "@excalidraw/excalidraw/index.css";
import { Excalidraw, MainMenu, serializeAsJSON } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useQuery } from "@tanstack/react-query";
import { MoveLeftIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type SceneData } from "@/lib/api-client";

const SAVE_DELAY_MS = 1000;

type SaveStatus = "saved" | "saving" | "error";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 text-slate-600 dark:from-slate-900 dark:to-slate-800 dark:text-slate-300">
      {children}
    </div>
  );
}

function Editor() {
  const router = useRouter();
  const { boardId } = useParams<{ boardId: string }>();
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI>();
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [saveError, setSaveError] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const lastSaved = useRef<string>();

  // The scene is only read once as Excalidraw's initialData, so never refetch.
  const { data: board, error } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => api.getBoard(boardId),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const save = useCallback(
    async (opts?: { keepalive?: boolean }) => {
      if (!excalidrawApi) return;
      // serializeAsJSON drops volatile app state (collaborators, dialogs, ...)
      // and deleted images, so only durable scene data is stored.
      const json = serializeAsJSON(
        excalidrawApi.getSceneElements(),
        excalidrawApi.getAppState(),
        excalidrawApi.getFiles(),
        "local",
      );
      if (json === lastSaved.current) return;

      const { elements, appState, files } = JSON.parse(json);
      const data: SceneData = { elements, appState, files: files ?? {} };
      setStatus("saving");
      try {
        await api.updateBoard(boardId, { data }, { keepalive: opts?.keepalive });
        lastSaved.current = json;
        setStatus("saved");
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed");
        setStatus("error");
      }
    },
    [excalidrawApi, boardId],
  );

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    await save();
  }, [save]);

  const onChange = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), SAVE_DELAY_MS);
  }, [save]);

  // Persist pending edits when the tab is hidden or closed.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        clearTimeout(timer.current);
        void save({ keepalive: true });
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [save]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (error) {
    return <Centered>{error.message}</Centered>;
  }
  if (!board) {
    return <Centered>Loading your scene...</Centered>;
  }

  const goBack = async () => {
    await flush();
    router.push(board.folderId ? `/folder/${board.folderId}` : "/");
  };

  return (
    <div className="h-screen bg-white dark:bg-slate-900">
      <Excalidraw
        onChange={onChange}
        excalidrawAPI={(api) => setExcalidrawApi(api)}
        initialData={
          board.data
            ? {
                elements: board.data.elements as never,
                appState: board.data.appState as never,
                files: board.data.files as never,
              }
            : undefined
        }
      >
        <MainMenu>
          <MainMenu.Item
            icon={<MoveLeftIcon className="text-slate-600 dark:text-slate-300" />}
            onSelect={goBack}
          >
            Back to boards
          </MainMenu.Item>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
      <div
        className="pointer-events-none fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs shadow dark:bg-slate-800/90 dark:text-slate-200"
        role="status"
      >
        {status === "saving" && "Saving..."}
        {status === "saved" && `${board.name} · Saved`}
        {status === "error" && (
          <span className="text-red-600">Not saved: {saveError}</span>
        )}
      </div>
    </div>
  );
}

export default Editor;
