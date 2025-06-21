import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Edit, Copy, Trash2, ExternalLink, Calendar, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import FileDialog from "./file-dialog";

type Props = {
  name: string;
  id: number;
  createdAt: Date;
};

function FileTile({ name, id, createdAt }: Props) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function deleteFile() {
    setIsDeleting(true);
    try {
      await db.files.delete(id);
    } finally {
      setIsDeleting(false);
    }
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
      {/* Hover glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500" />

      <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:border-slate-300 dark:group-hover:border-slate-600">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <FileDialog file={{ name, id }}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
              </FileDialog>
              <DropdownMenuItem onClick={duplicateFile}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Scene</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={deleteFile}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Preview Area */}
        <Link to={`/files/${id}`} className="block">
          <div className="relative h-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center group/preview hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300">
            {/* Placeholder preview content */}
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover/preview:scale-110 transition-transform duration-300">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 group-hover/preview:text-slate-700 dark:group-hover/preview:text-slate-300">
                Open to view
              </p>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 rounded-lg" />
            
            {/* Open indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300">
              <div className="bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-lg">
                <ExternalLink className="w-3 h-3 text-slate-600 dark:text-slate-300" />
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Ready
            </span>
          </div>
          <Button 
            asChild
            variant="ghost" 
            size="sm" 
            className="h-7 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Link to={`/files/${id}`}>
              Open
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FileTile;
