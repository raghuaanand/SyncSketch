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
import { cn } from "@/lib/utils";
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
      <div className="absolute -inset-0.5  rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />

      <div className="relative bg-white shadow-xl border border-black/30 p-4 rounded-lg space-y-3 hover:border-black/10 transition duration-300">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium truncate pr-4">{name}</h3>
            <p className="text-xs text-zinc-400">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <FileDialog
              file={{
                name,
                id,
              }}
            >
              <Button variant="ghost" size="icon" className="text-black/70 hover:text-black">
                <Pencil1Icon className="size-4" />
              </Button>
            </FileDialog>

            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-black/70 hover:text-black">
                    <DotsVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/80 backdrop-blur-lg border border-white/10">
                  <DropdownMenuItem className="focus:bg-black/10">
                    <DrawingPinIcon className="mr-2 size-4" />
                    Pin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={duplicateFile}
                    className="focus:bg-black/10"
                  >
                    <CopyIcon className="mr-2 size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:bg-black/10 focus:text-destructive">
                      <TrashIcon className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent className="bg-white/80 backdrop-blur-lg border border-black/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-black">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-800">
                    This action cannot be undone. This will permanently delete
                    this scene.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-black/10 text-black hover:bg-black/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className={cn(

                      "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    )}
                    onClick={deleteFile}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Link to={`/files/${id}`}>
          <div className="h-32 m-4 rounded-md  flex items-center justify-center border border-black/8">
            {/* <Pencil1Icon className="size-6 text-white/20" /> */}
          </div>
        </Link>
      </div>
    </div>
  );
}

export default FileTile;