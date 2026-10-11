// Board columns returned by the API; the (large) `data` scene is opt-in.
export const boardSelect = {
  id: true,
  name: true,
  kind: true,
  folderId: true,
  createdAt: true,
  updatedAt: true,
} as const;
