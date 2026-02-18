"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Moon,
    Sun,
    Palette,
    Search,
    Grid,
    List,
    Sparkles,
    LogOut,
    User,
    Crown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Diagram {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    lastOpenedAt: string;
}

interface Usage {
    current: number;
    limit: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [usage, setUsage] = useState<Usage>({ current: 0, limit: 3 });
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        fetchDiagrams();
    }, []);

    async function fetchDiagrams() {
        try {
            const res = await fetch("/api/diagrams");
            const data = await res.json();
            if (res.ok) {
                setDiagrams(data.diagrams);
                setUsage(data.usage);
            }
        } catch (error) {
            console.error("Failed to fetch diagrams:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createDiagram() {
        if (!newName.trim()) return;
        setCreating(true);

        try {
            const res = await fetch("/api/diagrams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/dashboard/diagrams/${data.id}`);
            } else if (data.upgradeRequired) {
                alert(data.message);
            }
        } catch (error) {
            console.error("Failed to create diagram:", error);
        } finally {
            setCreating(false);
            setShowCreateDialog(false);
            setNewName("");
        }
    }

    async function deleteDiagram(id: string) {
        if (!confirm("Are you sure you want to delete this diagram?")) return;

        try {
            const res = await fetch(`/api/diagrams/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchDiagrams();
            }
        } catch (error) {
            console.error("Failed to delete diagram:", error);
        }
    }

    const filteredDiagrams = diagrams.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const canCreate = usage.current < usage.limit;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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

                        <div className="flex items-center gap-3">
                            {/* Usage indicator */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full border border-slate-200">
                                <span className="text-sm text-slate-600">
                                    {usage.current}/{usage.limit} diagrams
                                </span>
                                {usage.current >= usage.limit && (
                                    <Link href="/pricing">
                                        <Crown className="w-4 h-4 text-yellow-500" />
                                    </Link>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDarkMode(!isDarkMode)}
                            >
                                {isDarkMode ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </Button>

                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => signOut().then(() => router.push("/"))}
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-12 lg:py-16">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="w-6 h-6 text-yellow-500" />
                                <span className="text-sm font-medium text-slate-600 bg-yellow-100 px-3 py-1 rounded-full">
                                    Welcome back, {session?.user?.name || "Creator"}!
                                </span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                                Your{" "}
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                                    Creative Space
                                </span>
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {canCreate ? (
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                                    onClick={() => setShowCreateDialog(true)}
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create New Diagram
                                </Button>
                            ) : (
                                <Link href="/pricing">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
                                    >
                                        <Crown className="w-5 h-5 mr-2" />
                                        Upgrade to Create More
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Create Dialog */}
            {showCreateDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-semibold mb-4">Create New Diagram</h3>
                        <Input
                            placeholder="Diagram name..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateDialog(false);
                                    setNewName("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createDiagram}
                                disabled={!newName.trim() || creating}
                                className="bg-gradient-to-r from-blue-600 to-purple-600"
                            >
                                {creating ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Diagrams Section */}
            <section className="container mx-auto px-4 lg:px-6 pb-16">
                <div className="backdrop-blur-xl bg-white/70 border border-white/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900">
                                Your Diagrams
                            </h3>
                            <p className="text-slate-600">
                                {filteredDiagrams.length} diagram
                                {filteredDiagrams.length !== 1 ? "s" : ""} available
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Search diagrams..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-48 bg-slate-100 rounded-lg animate-pulse"
                                />
                            ))}
                        </div>
                    ) : filteredDiagrams.length > 0 ? (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "space-y-4"
                            }
                        >
                            {filteredDiagrams.map((diagram) => (
                                <div
                                    key={diagram.id}
                                    className="group relative bg-white/90 backdrop-blur-xl shadow-xl border border-slate-200/50 p-6 rounded-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 min-w-0 flex-1">
                                            <h3 className="font-semibold text-slate-800 truncate text-lg">
                                                {diagram.name}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(diagram.updatedAt), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/dashboard/diagrams/${diagram.id}`}
                                        className="block mt-4"
                                    >
                                        <div className="h-32 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center border border-slate-200/50 hover:border-blue-300/50 transition-colors">
                                            <Palette className="w-8 h-8 text-blue-400" />
                                        </div>
                                    </Link>

                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href={`/dashboard/diagrams/${diagram.id}`}
                                            className="flex-1"
                                        >
                                            <Button variant="outline" size="sm" className="w-full">
                                                Open
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteDiagram(diagram.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {searchQuery ? "No diagrams found" : "No diagrams yet"}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                {searchQuery
                                    ? "Try adjusting your search terms."
                                    : "Create your first diagram to get started."}
                            </p>
                            {!searchQuery && canCreate && (
                                <Button
                                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                                    onClick={() => setShowCreateDialog(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Diagram
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
