"use client";

import { ComponentNode } from "@/types";
import TreeNode from "./TreeNode";
import { Layers, Monitor, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

interface ComponentTreeProps {
    root: ComponentNode;
    selectedId: string | null | undefined;
    onSelect: (node: ComponentNode) => void;
}

export default function ComponentTree({ root, selectedId, onSelect }: ComponentTreeProps) {
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const stats = useMemo(() => {
        let totalComponents = 0;
        const screens = new Set<string>();

        const traverse = (node: ComponentNode) => {
            totalComponents++;
            if (node.type === 'page') {
                screens.add(node.name);
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        };

        traverse(root);
        return {
            count: totalComponents,
            screenCount: screens.size || 1
        };
    }, [root]);

    const toggleGroup = (group: string) => {
        const next = new Set(collapsedGroups);
        if (next.has(group)) next.delete(group);
        else next.add(group);
        setCollapsedGroups(next);
    };

    const TypeGroup = ({ name, color }: { name: string, color: string }) => (
        <div className="mb-1">
            <button
                onClick={() => toggleGroup(name)}
                className="w-full flex items-center justify-between px-5 py-2 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{name}</span>
                </div>
                {collapsedGroups.has(name) ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronUp className="w-3 h-3 text-gray-400" />}
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white select-none">
            {/* Summary Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Structure</span>
                    <Layers className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                    {stats.count} components across {stats.screenCount} {stats.screenCount === 1 ? 'screen' : 'screens'}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
                {/* Type Groups */}
                <TypeGroup name="Pages" color="bg-blue-500" />
                {!collapsedGroups.has("Pages") && (
                    <div className="mb-2">
                        <TreeNode
                            node={root}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            depth={0}
                        />
                    </div>
                )}

                <TypeGroup name="Layouts" color="bg-purple-500" />
                <TypeGroup name="Components" color="bg-teal-500" />
                <TypeGroup name="Atoms" color="bg-gray-400" />
            </div>
        </div>
    );
}
