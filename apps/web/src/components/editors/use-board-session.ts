"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Board, type BoardData } from "@/lib/api-client";
import { useDiscardBoardCache } from "@/lib/queries";

const SAVE_DELAY_MS = 1000;

export type SaveStatus = "saved" | "saving" | "error";

// Autosave and navigation shared by every editor. `read` returns the current
// snapshot of the editor, or null while it is not mounted yet.
export function useBoardSession(board: Board, read: () => BoardData | null) {
  const router = useRouter();
  const qc = useQueryClient();
  const discardBoardCache = useDiscardBoardCache();
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const lastSaved = useRef<string>();
  const readRef = useRef(read);
  readRef.current = read;

  const save = useCallback(
    async (keepalive?: boolean) => {
      const data = readRef.current();
      if (!data) return;
      const serialized = JSON.stringify(data);
      if (serialized === lastSaved.current) return;

      setStatus("saving");
      try {
        await api.updateBoard(board.id, { data }, { keepalive });
        lastSaved.current = serialized;
        setStatus("saved");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
        setStatus("error");
      }
    },
    [board.id],
  );

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), SAVE_DELAY_MS);
  }, [save]);

  // Persist pending edits when the tab is hidden or closed.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        clearTimeout(timer.current);
        void save(true);
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [save]);

  // A cached scene must not outlive this session: reopening would load stale data.
  useEffect(() => {
    clearTimeout(timer.current);
    return () => {
      clearTimeout(timer.current);
      discardBoardCache(board.id);
    };
  }, [board.id, discardBoardCache]);

  const goBack = useCallback(async () => {
    clearTimeout(timer.current);
    await save();
    await qc.invalidateQueries({ queryKey: ["items"] });
    router.push(board.folderId ? `/folder/${board.folderId}` : "/");
  }, [save, qc, router, board.folderId]);

  return { status, error, schedule, goBack };
}
