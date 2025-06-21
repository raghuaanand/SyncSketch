import Editor from "@/components/Editor";
import { useParams } from "react-router-dom";

function File() {
  const { fileId } = useParams();

  if (!fileId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 text-red-600 dark:text-red-400">⚠</div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Scene Not Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">The requested scene could not be located</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Editor />
    </div>
  );
}

export default File;
