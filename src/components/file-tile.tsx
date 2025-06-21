import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CopyIcon,
  DotsVerticalIcon,
  DrawingPinIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import FileDialog from "./file-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db } from "@/lib/db";

type Props = {
  name: string;
  id: number;
  createdAt: Date;
};

function FileTile({ name, id, createdAt }: Props) {
  async function deleteFile() {
    await db.files.delete(id);
  }

  async function duplicateFile() {
    const file = await db.files.where({ id }).first();
    if (!file) return;
    await db.files.add({
      name: `${file?.name} - copy`,
      createdAt: new Date(),
      data: file.data && {
        elements: file.data.elements,
        appState: file.data.appState,
        files: file.data.files,
      },
    });
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />

      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 rounded-lg space-y-4 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="space-y-2 min-w-0 flex-1">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate pr-4 text-lg leading-tight">
              {name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FileDialog
              file={{
                name,
                id,
              }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Pencil1Icon className="size-4" />
              </Button>
            </FileDialog>

            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <DotsVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                  <DropdownMenuItem className="hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:bg-slate-50 dark:focus:bg-slate-700/50">
                    <DrawingPinIcon className="mr-2 size-4" />
                    Pin Scene
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={duplicateFile}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:bg-slate-50 dark:focus:bg-slate-700/50"
                  >
                    <CopyIcon className="mr-2 size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20">
                      <TrashIcon className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-800 dark:text-slate-100 text-xl font-semibold">
                    Delete Scene
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                    This action cannot be undone. This will permanently delete "{name}" and all its contents.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={deleteFile}
                  >
                    Delete Scene
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Link to={`/files/${id}`} className="block">
          <div className="h-40 -mx-2 -mb-2 mt-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 group-hover:shadow-inner">
            <div className="text-slate-400 dark:text-slate-500 transition-colors duration-300 group-hover:text-blue-500 dark:group-hover:text-blue-400">
              <div className="w-12 h-12 rounded-full bg-white/60 dark:bg-slate-800/60 flex items-center justify-center backdrop-blur-sm">
                <Pencil1Icon className="size-6" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default FileTile;