"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
    () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
    { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-700">Loading editor...</h3>
                    <p className="text-sm text-slate-500">Preparing your workspace</p>
                </div>
            </div>
        </div>
    );
}

interface DiagramData {
    id: string;
    name: string;
    data: {
        elements: unknown[];
        appState: Record<string, unknown>;
        files: Record<string, unknown>;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExcalidrawAPI = any;

export default function DiagramEditorPage() {
    const router = useRouter();
    const params = useParams();
    const diagramId = params.id as string;

    const [diagram, setDiagram] = useState<DiagramData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const excalidrawApiRef = useRef<ExcalidrawAPI>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch diagram data
    useEffect(() => {
        async function fetchDiagram() {
            try {
                const res = await fetch(`/api/diagrams/${diagramId}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError("Diagram not found");
                    } else if (res.status === 403) {
                        setError("Access denied");
                    } else {
                        setError("Failed to load diagram");
                    }
                    return;
                }
                const data = await res.json();
                setDiagram(data);
            } catch (err) {
                console.error("Error fetching diagram:", err);
                setError("Failed to load diagram");
            } finally {
                setLoading(false);
            }
        }

        fetchDiagram();
    }, [diagramId]);

    // Save function
    const save = useCallback(async () => {
        if (!excalidrawApiRef.current || !diagram) return;

        const api = excalidrawApiRef.current;
        const elements = api.getSceneElements();
        const appState = api.getAppState();
        const files = api.getFiles();

        // Don't save if nothing has changed
        if (elements.length === 0) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/diagrams/${diagramId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: { elements, appState, files },
                }),
            });

            if (res.ok) {
                setLastSaved(new Date());
            }
        } catch (err) {
            console.error("Error saving diagram:", err);
        } finally {
            setSaving(false);
        }
    }, [diagram, diagramId]);

    // Debounced save on change
    const handleChange = useCallback(() => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(() => {
            save();
        }, 500);
    }, [save]);

    // Save on page unload
    useEffect(() => {
        window.addEventListener("beforeunload", save);
        return () => {
            window.removeEventListener("beforeunload", save);
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [save]);

    if (loading) {
        return <EditorSkeleton />;
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">⚠</span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-700">{error}</h3>
                        <Button variant="outline" onClick={() => router.push("/dashboard")}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!diagram) {
        return <EditorSkeleton />;
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <h1 className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">
                        {diagram.name}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {saving ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </div>
                    ) : lastSaved ? (
                        <span className="text-sm text-slate-500">
                            Saved {lastSaved.toLocaleTimeString()}
                        </span>
                    ) : null}
                    <Button size="sm" onClick={save} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </div>
            </header>

            {/* Editor */}
            <div className="flex-1">
                <Excalidraw
                    excalidrawAPI={(api: ExcalidrawAPI) => {
                        excalidrawApiRef.current = api;
                    }}
                    initialData={{
                        elements: (diagram.data?.elements || []) as never,
                        appState: (diagram.data?.appState || {}) as never,
                        files: (diagram.data?.files || {}) as never,
                    }}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}
