export type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BoardItem = {
  id: string;
  name: string;
  folderId: string | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Items = {
  path: { id: string; name: string }[];
  folders: FolderItem[];
  boards: BoardItem[];
};

export type SceneData = {
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
};

export type Board = BoardItem & { data: SceneData | null };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const send = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  items: (parentId: string | null) =>
    request<Items>(`/api/items${parentId ? `?parentId=${parentId}` : ""}`),
  createFolder: (name: string, parentId: string | null) =>
    request<FolderItem>("/api/folders", send("POST", { name, parentId })),
  updateFolder: (id: string, patch: { name?: string; parentId?: string | null }) =>
    request<FolderItem>(`/api/folders/${id}`, send("PATCH", patch)),
  deleteFolder: (id: string) => request<void>(`/api/folders/${id}`, send("DELETE")),
  createBoard: (name: string, folderId: string | null) =>
    request<BoardItem>("/api/boards", send("POST", { name, folderId })),
  getBoard: (id: string) => request<Board>(`/api/boards/${id}`),
  updateBoard: (
    id: string,
    patch: { name?: string; folderId?: string | null; data?: SceneData },
    init?: RequestInit,
  ) => request<BoardItem>(`/api/boards/${id}`, { ...send("PATCH", patch), ...init }),
  duplicateBoard: (id: string) =>
    request<BoardItem>(`/api/boards/${id}/duplicate`, send("POST")),
  deleteBoard: (id: string) => request<void>(`/api/boards/${id}`, send("DELETE")),
};
