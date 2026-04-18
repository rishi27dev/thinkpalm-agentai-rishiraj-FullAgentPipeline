"use client";

import { useState, useMemo } from "react";
import { Button } from "../ui/Button";
import { Upload, FileText, X, Wand2, Zap } from "lucide-react";

interface PrdEditorProps {
    content: string;
    setContent: (content: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export default function PrdEditor({ content, setContent, onGenerate, isGenerating }: PrdEditorProps) {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setContent(text);
            };
            reader.readAsText(file);
        }
    };

    const stats = useMemo(() => {
        const chars = content.length;
        const words = content.trim().split(/\s+/).filter(Boolean).length;
        // Rough estimation: 1 token ~= 4 characters or 0.75 words
        const estTokens = Math.ceil(chars / 4);
        return { chars, words, estTokens };
    }, [content]);

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    PRD Input
                </label>
                <div className="relative">
                    <input
                        type="file"
                        id="prd-upload"
                        className="hidden"
                        accept=".md,.txt"
                        onChange={handleFileUpload}
                    />
                    <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs text-gray-500 hover:text-black"
                        onClick={() => document.getElementById("prd-upload")?.click()}
                    >
                        <Upload className="w-3 h-3 mr-1.5" />
                        Upload
                    </Button>
                </div>
            </div>

            <div className="relative flex-1 min-h-[300px]">
                {fileName && (
                    <div className="absolute top-2 right-2 flex items-center bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-gray-600 border border-gray-200 z-10">
                        <FileText className="w-3 h-3 mr-1" />
                        {fileName}
                        <button onClick={() => setFileName(null)} className="ml-1.5 hover:text-black">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your application requirements in detail..."
                    className="w-full h-full p-4 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none resize-none font-mono leading-relaxed bg-gray-50/50 text-gray-900"
                />
            </div>

            <div className="flex items-center justify-between px-1">
                <div className="flex space-x-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Characters</span>
                        <span className="text-xs font-medium text-gray-600">{stats.chars.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Est. Tokens</span>
                        <span className="text-xs font-medium text-gray-600 font-mono italic flex items-center">
                            <Zap className="w-2.5 h-2.5 mr-1 text-amber-500" />
                            ~{stats.estTokens.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <Button
                onClick={onGenerate}
                disabled={isGenerating || !content.trim()}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate UI</span>
                    </>
                )}
            </Button>
        </div>
    );
}
