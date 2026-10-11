"use client";

import { useParams } from "next/navigation";
import { BoardEditor } from "@/components/editors";
import { ScreenMessage } from "@/components/editors/screen-message";
import { useBoard } from "@/lib/queries";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: board, error } = useBoard(boardId);

  if (error) return <ScreenMessage>{error.message}</ScreenMessage>;
  if (!board) return <ScreenMessage pulse>Opening your board</ScreenMessage>;
  return <BoardEditor board={board} />;
}
