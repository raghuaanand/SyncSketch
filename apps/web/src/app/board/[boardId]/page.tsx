"use client";

import dynamic from "next/dynamic";

// Excalidraw touches `window`, so it must only render on the client.
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function BoardPage() {
  return (
    <div className="h-screen">
      <Editor />
    </div>
  );
}
