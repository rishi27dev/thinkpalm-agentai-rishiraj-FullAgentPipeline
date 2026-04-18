"use client";

import { ComponentNode } from "@/types";
import Editor from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

interface CodePanelProps {
    node: ComponentNode | null;
}

export default function CodePanel({ node }: CodePanelProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (node?.code) {
            navigator.clipboard.writeText(node.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!node) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                </div>
                <p className="text-sm">Select a component to view code</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50/50">
                <span className="text-xs font-mono font-bold text-gray-600 truncate max-w-[200px]">
                    {node.name}.tsx
                </span>
                <Button variant="ghost" className="h-8 px-2 text-[10px]" onClick={handleCopy}>
                    {copied ? (
                        <Check className="w-3 h-3 mr-1.5 text-green-500" />
                    ) : (
                        <Copy className="w-3 h-3 mr-1.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                </Button>
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    theme="light"
                    value={node.code || "// No code available for this component"}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                    }}
                />
            </div>
        </div>
    );
}
