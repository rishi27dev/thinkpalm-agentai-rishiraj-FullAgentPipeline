"use client";

import PrdEditor from "@/components/editor/PrdEditor";
import PromptConfig from "@/components/editor/PromptConfig";
import ComponentTree from "@/components/tree/ComponentTree";
import LivePreview from "@/components/preview/LivePreview";
import CodePanel from "@/components/preview/CodePanel";
import ExportMenu from "@/components/export/ExportMenu";
import GenerationSkeleton from "@/components/ui/GenerationSkeleton";
import PipelinePanel from "@/components/pipeline/PipelinePanel";
import { useState, useCallback, useEffect, useRef } from "react";
import { ComponentNode, GenerationConfig, GenerationResult } from "@/types";
import { ChevronRight, FileText, Cpu, Eye, Code2, Layers, Activity } from "lucide-react";

export default function Home() {
    // Input State
    const [prd, setPrd] = useState("");
    const [config, setConfig] = useState<GenerationConfig>({
        model: "gemini-2.5-flash",
        complexity: "standard",
        tone: "corporate",
        includeAnimations: true,
        designSystem: "shadcn"
    });

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState("");
    const [result, setResult] = useState<GenerationResult | null>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<"tree" | "preview">("tree");
    const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null);
    const [showPipeline, setShowPipeline] = useState(true);

    // Resizable Footer State
    const [footerHeight, setFooterHeight] = useState(400);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newHeight = window.innerHeight - e.clientY;
            // Min 100px, Max 85vh
            if (newHeight > 100 && newHeight < window.innerHeight * 0.85) {
                setFooterHeight(newHeight);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        } else {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        }

        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    // Pipeline Trigger Ref
    const pipelineRef = useRef<{ triggerRun: () => void } | null>(null);

    // Auto-select root node when result changes
    useEffect(() => {
        if (result?.tree) {
            setSelectedNode(result.tree);
        }
    }, [result]);

    const handleGenerate = useCallback(() => {
        if (pipelineRef.current) {
            pipelineRef.current.triggerRun();
        }
    }, []);

    const onPipelineComplete = useCallback((finalResult: GenerationResult) => {
        setResult(finalResult);
        setActiveTab("tree");
    }, []);

    return (
        <main className="flex flex-col h-screen overflow-hidden bg-white text-gray-900 font-sans">
            {/* TOP SECTION: 3 PANELS */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT PANEL: PRD & CONFIG (380px) */}
                <aside className="w-[380px] border-r border-gray-200 flex flex-col bg-white shrink-0">
                    <div className="h-14 border-b border-gray-200 flex items-center px-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Agent<span className="text-blue-600">UI</span></span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                        <PrdEditor
                            content={prd}
                            setContent={setPrd}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                        />
                        <PromptConfig
                            config={config}
                            setConfig={setConfig}
                        />
                    </div>
                </aside>

                {/* CENTER PANEL: EXPLORER & PREVIEW (flex-1) */}
                <section className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden relative">
                    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6 justify-between shrink-0">
                        <div className="flex space-x-8 h-full">
                            <button
                                onClick={() => setActiveTab("tree")}
                                className={`flex items-center space-x-2 text-sm font-semibold transition-all relative h-full px-1 ${activeTab === "tree" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <Cpu className="w-4 h-4" />
                                <span>Component Tree</span>
                                {activeTab === "tree" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab("preview")}
                                className={`flex items-center space-x-2 text-sm font-semibold transition-all relative h-full px-1 ${activeTab === "preview" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <Eye className="w-4 h-4" />
                                <span>Live Preview</span>
                                {activeTab === "preview" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                            </button>
                        </div>

                        {result && !isGenerating && (
                            <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase tracking-widest">
                                Ready
                            </div>
                        )}
                    </header>

                    <div className="flex-1 overflow-hidden">
                        {isGenerating ? (
                            <GenerationSkeleton status="Agentic pipeline in progress..." />
                        ) : result ? (
                            activeTab === "tree" ? (
                                <div className="h-full overflow-y-auto p-6">
                                    <ComponentTree
                                        root={result.tree}
                                        onSelect={setSelectedNode}
                                        selectedId={selectedNode?.id}
                                    />
                                </div>
                            ) : (
                                <div className="h-full p-6">
                                    <LivePreview components={[result.tree]} />
                                </div>
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                    <Code2 className="w-8 h-8 text-gray-200" />
                                </div>
                                <h3 className="text-gray-900 font-semibold mb-1">No Project Loaded</h3>
                                <p className="text-sm max-w-xs">Enter your product requirements and click Generate UI to begin the multi-agent pipeline.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* RIGHT PANEL: CODE & EXPORT (340px) */}
                <aside className="w-[340px] border-l border-gray-200 flex flex-col bg-white shrink-0">
                    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Implementation</span>
                        <ExportMenu result={result} selectedNode={selectedNode} />
                    </header>

                    <div className="flex-1 overflow-hidden p-6">
                        <CodePanel node={selectedNode} />
                    </div>
                </aside>
            </div>

            {/* BOTTOM PANEL: AGENT PIPELINE MONITOR */}
            <footer
                className="border-t border-gray-200 bg-white flex flex-col shrink-0 relative"
                style={{ height: showPipeline ? `${footerHeight}px` : '40px' }}
            >
                {/* Resize Handle */}
                {showPipeline && (
                    <div
                        className={`absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize group z-50 transition-colors ${isResizing ? 'bg-blue-500/20' : 'hover:bg-blue-500/10'}`}
                        onMouseDown={startResizing}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-gray-200 rounded-full group-hover:bg-blue-300 transition-colors" />
                    </div>
                )}

                <header className="h-10 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between px-6 shrink-0 select-none">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Agent Pipeline Monitor</span>
                    </div>
                    <button
                        onClick={() => setShowPipeline(!showPipeline)}
                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPipeline ? 'Collapse' : 'Expand'}
                    </button>
                </header>
                {showPipeline && (
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <PipelinePanel
                            ref={pipelineRef}
                            prd={prd}
                            config={config}
                            onComplete={onPipelineComplete}
                            isGenerating={isGenerating}
                            setIsGenerating={setIsGenerating}
                        />
                    </div>
                )}
            </footer>
        </main>
    );
}
