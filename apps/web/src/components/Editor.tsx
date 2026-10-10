"use client";

import "@excalidraw/excalidraw/index.css";
import { Excalidraw, MainMenu, serializeAsJSON } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useQuery } from "@tanstack/react-query";
import { MoveLeftIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";
import { api, type SceneData } from "@/lib/api-client";

const SAVE_DELAY_MS = 1000;

type SaveStatus = "saved" | "saving" | "error";

function Centered({ children, pulse }: { children: React.ReactNode; pulse?: boolean }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <LogoMark className={pulse ? "size-12 animate-pulse" : "size-12"} />
      <p className="font-serif text-xl text-muted-foreground">{children}</p>
    </div>
  );
}

function Editor() {
  const router = useRouter();
  const { isDarkMode, setTheme } = useTheme();
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
    return <Centered pulse>Opening your board</Centered>;
  }

  const goBack = async () => {
    await flush();
    router.push(board.folderId ? `/folder/${board.folderId}` : "/");
  };

  return (
    <div className="h-screen bg-background">
      <Excalidraw
        onChange={onChange}
        theme={isDarkMode ? "dark" : "light"}
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
            icon={<MoveLeftIcon />}
            onSelect={goBack}
          >
            Back to boards
          </MainMenu.Item>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme onSelect={(theme) => setTheme(theme)} />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
      <div
        className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-card-foreground shadow-md"
        role="status"
      >
        <span
          className={`size-2 shrink-0 rounded-full ${
            status === "saved" ? "bg-success" : status === "saving" ? "animate-pulse bg-primary" : "bg-destructive"
          }`}
        />
        <span className="truncate">
          {status === "saving" && "Saving..."}
          {status === "saved" && `${board.name} · Saved`}
          {status === "error" && `Not saved: ${saveError}`}
        </span>
      </div>
    </div>
  );
}

export default Editor;
