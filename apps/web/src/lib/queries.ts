"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api-client";

export const useItems = (parentId: string | null, enabled = true) =>
  useQuery({
    queryKey: ["items", parentId],
    queryFn: () => api.items(parentId),
    enabled,
  });

// Every mutation refreshes all folder listings; they are small and cheap.
function useListMutation<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export const useCreateFolder = () =>
  useListMutation((v: { name: string; parentId: string | null }) =>
    api.createFolder(v.name, v.parentId),
  );
export const useUpdateFolder = () =>
  useListMutation((v: { id: string; name?: string; parentId?: string | null }) =>
    api.updateFolder(v.id, { name: v.name, parentId: v.parentId }),
  );
export const useDeleteFolder = () => useListMutation((id: string) => api.deleteFolder(id));

export const useUpdateBoardMeta = () =>
  useListMutation((v: { id: string; name?: string; folderId?: string | null }) =>
    api.updateBoard(v.id, { name: v.name, folderId: v.folderId }),
  );
export const useDuplicateBoard = () => useListMutation((id: string) => api.duplicateBoard(id));
export const useDeleteBoard = () => useListMutation((id: string) => api.deleteBoard(id));
export const useCreateBoard = () =>
  useListMutation((v: { name: string; folderId: string | null }) =>
    api.createBoard(v.name, v.folderId),
  );
