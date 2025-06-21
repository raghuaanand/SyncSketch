import { db } from "@/lib/db";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { useLiveQuery } from "dexie-react-hooks";
import { MoveLeftIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Editor() {
  const navigator = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [excaligrawApi, setExcaligrawApi] = useState<ExcalidrawImperativeAPI>();

  const { fileId } = useParams();

  const file = useLiveQuery(
    () => db.files.where({ id: Number(fileId) }).first(),
    [fileId],
  );

  const save = useCallback(async () => {
    if (!excaligrawApi) {
      return;
    }
    const data = {
      elements: excaligrawApi.getSceneElements(),
      appState: excaligrawApi.getAppState(),
      files: excaligrawApi.getFiles(),
    };

    if (data.elements.length <= 0) {
      return;
    }

    await db.files.update(Number(fileId), { data });
  }, [excaligrawApi, fileId]);

  useEffect(() => {
    window.addEventListener("beforeunload", save);
    return () => {
      window.removeEventListener("beforeunload", save);
    };
  }, [save]);

  const debouncedSave = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(async () => {
      await save();
    }, 200);
  };

  if (!file) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Loading your scene...</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we prepare your workspace</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-slate-900">
      <Excalidraw
        onChange={debouncedSave}
        excalidrawAPI={(api) => setExcaligrawApi(api)}
        initialData={{
          elements: file.data?.elements,
          appState: file.data?.appState,
          files: file.data?.files,
        }}
      >
        <MainMenu>
          <MainMenu.Item
            icon={<MoveLeftIcon className="text-slate-600 dark:text-slate-300" />}
            children="Back to Home"
            onSelect={() => {
              navigator(-1);
            }}
          ></MainMenu.Item>

          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
    </div>
  );
}

export default Editor;
