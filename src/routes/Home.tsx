import CreateFileDialog from "@/components/file-dialog"
import FileTile from "@/components/file-tile"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { Github, Menu, Moon, Plus } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"

function Home() {
  const files = useLiveQuery(() => db.files.toArray())

  return (
    <div className="h-full bg-white">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 " />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <nav className="sticky top-0 z-50 bg-white backdrop-blur-xl border-b border-white/10 shadow-md">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0  animate-gradient rounded-lg blur" />
                <span className="relative  px-3 py-1 rounded-lg text-2xl font-bold">SyncSketch</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-black/70 hover:text-white">
                <Moon className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-black/70 hover:text-white md:hidden">
                <Menu className="size-5" />
              </Button>
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" className="text-black/70 hover:text-white">
                  Documentation
                </Button>
                <Button variant="ghost" className="text-black/70 hover:text-white">
                  Examples
                </Button>
                <Button className="relative group">
                  <div className="absolute -inset-0.5  rounded-lg blur opacity-60 group-hover:opacity-100 transition" />
                  <span className="relative px-4 py-2 rounded-lg flex items-center gap-2">
                    <Github className="size-4" />
                    Sign In
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-24 text-center relative overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 pb-2">
                  Your Creative Space, Elevated
                </h1>
                <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                  Create, collaborate, and bring your ideas to life with our enhanced Excalidraw experience. Seamlessly
                  manage multiple boards and share your creativity with the world.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CreateFileDialog>
                  <Button className="relative group">
                    <div className="absolute -inset-0.5  rounded-lg blur opacity-60 group-hover:opacity-100 transition" />
                    <span className="relative  px-4 py-2 rounded-lg flex items-center gap-2">
                      <Plus className="size-4" />
                      New Board
                    </span>
                  </Button>
                </CreateFileDialog>
              </div>
            </div>
          </div>
        </section>

        {/* Files Section */}
        <section className="container pb-24">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">Your Boards</h2>
                <p className="text-zinc-400 text-sm">Create and manage your SyncSketch boards</p>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {files ? (
                files.map((file, i) => {
                  if (!file.id) return null
                  return <FileTile key={i} name={file.name} id={file.id} createdAt={file.createdAt} />
                })
              ) : (
                <div className="col-span-full text-center py-12 text-zinc-400">
                  <div className="animate-pulse">Loading your scenes...</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home

