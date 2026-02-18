import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles, Check, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SyncSketch
                </h1>
                <p className="text-xs text-slate-500">Creative whiteboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <span className="text-sm font-medium text-slate-600 bg-yellow-100 px-3 py-1 rounded-full">
                  Powered by Excalidraw
                </span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Bring Your Ideas to{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                  Life
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Create stunning visual diagrams, sketches, and illustrations
                with our intuitive whiteboard experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 lg:px-6">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Everything you need to create
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                Freehand Drawing
              </h4>
              <p className="text-slate-600">
                Sketch freely with pen and stylus support. Create diagrams that
                look hand-drawn.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                Cloud Sync
              </h4>
              <p className="text-slate-600">
                Your diagrams are automatically saved to the cloud. Access them
                from anywhere.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <ArrowRight className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                Export Anywhere
              </h4>
              <p className="text-slate-600">
                Export your work as PNG, SVG, or embed directly in your
                documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to start creating?
            </h3>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of creators who use SyncSketch to bring their ideas
              to life.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg"
              >
                Get Started — It&apos;s Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200">
        <div className="container mx-auto px-4 lg:px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} SyncSketch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
