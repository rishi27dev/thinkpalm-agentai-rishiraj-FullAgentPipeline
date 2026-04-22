"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button";
import { Download, ExternalLink, ChevronDown, Copy, Check, Code2 } from "lucide-react";
import { toZip } from "@/lib/export/toZip";
import { toStackBlitz } from "@/lib/export/toStackBlitz";
import { GenerationResult, ComponentNode } from "@/types";

interface ExportMenuProps {
    result: GenerationResult | null;
    selectedNode: ComponentNode | null;
}

export default function ExportMenu({ result, selectedNode }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle outside click to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCopy = async () => {
        if (!selectedNode) return;
        try {
            await navigator.clipboard.writeText(selectedNode.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleZipExport = async () => {
        if (!result) return;
        setIsOpen(false);
        await toZip(result);
    };

    const handleStackBlitzExport = () => {
        if (!result) return;
        setIsOpen(false);
        toStackBlitz(result);
    };

    const isDisabled = !result;

    return (
        <div className="relative" ref={menuRef}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDisabled}
                className={`h-9 px-4 text-[10px] font-bold uppercase tracking-widest transition-all ${isOpen ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : ''
                    }`}
            >
                Export
                <ChevronDown className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right">
                    <div className="p-2 space-y-1">
                        <div className="px-3 py-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Actions</span>
                        </div>

                        <button
                            onClick={handleCopy}
                            disabled={!selectedNode}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className={`w-4 h-4 ${selectedNode ? 'text-gray-400 group-hover:text-blue-600' : 'text-gray-200'}`} />
                                )}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">{copied ? "Copied!" : "Copy Component"}</span>
                                <span className="text-[10px] text-gray-400">Copy JSX to clipboard</span>
                            </div>
                        </button>

                        <div className="h-px bg-gray-100 my-1 mx-2" />

                        <button
                            onClick={handleZipExport}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                                <Download className="w-4 h-4 text-gray-400 group-hover:text-black" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">Download ZIP</span>
                                <span className="text-[10px] text-gray-400">Full source with README</span>
                            </div>
                        </button>

                        <button
                            onClick={handleStackBlitzExport}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-black" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">Live Preview</span>
                                <span className="text-[10px] text-gray-400">Open in StackBlitz</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
