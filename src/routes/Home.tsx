import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Moon, Sun, Palette, Search, Grid, List, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/loading";
import { useTheme } from "@/components/theme-provider";
import FileDialog from "@/components/file-dialog";
import FileTile from "@/components/file-tile";

function Home() {
  const files = useLiveQuery(() => db.files.toArray());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const { isDarkMode, toggleDarkMode } = useTheme();

  const filteredFiles = files?.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Palette className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SyncSketch
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Creative whiteboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                  New & Improved Experience
                </span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Bring Your Ideas to{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                  Life
                </span>
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Create stunning visual diagrams, sketches, and illustrations with our intuitive whiteboard experience.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <FileDialog>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 group">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Create New Scene
                </Button>
              </FileDialog>
              
              {files && files.length > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  or browse your {files.length} existing scene{files.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Files Section */}
      {files && files.length > 0 && (
        <section className="container mx-auto px-4 lg:px-6 pb-16 lg:pb-24">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/30 dark:border-slate-700/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
            {/* Search and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your Scenes</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {filteredFiles.length} scene{filteredFiles.length !== 1 ? 's' : ''} available
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search scenes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="shrink-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="shrink-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Files Grid/List */}
            {!files ? (
              // Loading state with skeletons
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-4"
              }>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredFiles.length > 0 ? (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-4"
              }>
                {filteredFiles.map((file) => (
                  <FileTile
                    key={file.id}
                    id={file.id!}
                    name={file.name}
                    createdAt={file.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No scenes found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Create your first scene to get started.'}
                </p>
                {!searchQuery && (
                  <FileDialog>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Scene
                    </Button>
                  </FileDialog>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State for New Users */}
      {(!files || files.length === 0) && (
        <section className="container mx-auto px-4 lg:px-6 pb-16 lg:pb-24">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/30 dark:border-slate-700/30 rounded-3xl p-8 lg:p-12 shadow-2xl text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Palette className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Welcome to SyncSketch
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
              Start creating beautiful diagrams, sketches, and visual ideas. Your creative journey begins with a single scene.
            </p>
            <FileDialog>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Scene
              </Button>
            </FileDialog>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;

