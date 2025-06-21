import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, type PropsWithChildren } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { db } from "@/lib/db";
import { useNavigate } from "react-router-dom";

interface FileDialogProps extends PropsWithChildren {
  file?: {
    name: string;
    id: number;
  };
}

function FileDialog({ children, file }: FileDialogProps) {
  const [name, setName] = useState(file?.name || "");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function createFile() {
    if (!name.trim()) return;
    
    const id = await db.files.add({
      name: name.trim(),
      createdAt: new Date(),
    });
    setOpen(false);
    setName("");
    navigate(`/files/${id}`);
  }

  async function updateFile() {
    if (!file?.id || !name.trim()) return;
    
    await db.files.update(file.id, { name: name.trim() });
    setOpen(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file?.id) {
      updateFile();
    } else {
      createFile();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {file?.id ? "Rename Scene" : "Create New Scene"}
          </DialogTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {file?.id 
              ? "Give your scene a new name to better organize your work." 
              : "Start your creative journey with a new drawing scene."
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="scene-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Scene Name
            </Label>
            <Input
              id="scene-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter scene name..."
              className="h-11 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-3 pt-4">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 sm:flex-none border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={!name.trim()}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {file?.id ? "Update" : "Create Scene"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default FileDialog;
