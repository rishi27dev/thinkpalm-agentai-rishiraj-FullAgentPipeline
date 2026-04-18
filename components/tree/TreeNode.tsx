"use client";

import { ComponentNode } from "@/types";
import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface TreeNodeProps {
    node: ComponentNode;
    onSelect: (node: ComponentNode) => void;
    selectedId: string | null | undefined;
    depth: number;
}

export default function TreeNode({ node, onSelect, selectedId, depth }: TreeNodeProps) {
    const [isOpen, setIsOpen] = useState(true);
    const isSelected = selectedId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const dotColor = useMemo(() => {
        switch (node.type) {
            case 'page': return 'bg-blue-500';
            case 'layout': return 'bg-purple-500';
            case 'section': return 'bg-amber-500';
            case 'component': return 'bg-teal-500';
            case 'atom': return 'bg-gray-400';
            default: return 'bg-gray-300';
        }
    }, [node.type]);

    const propCount = Object.keys(node.props || {}).length;

    return (
        <div className="group animate-fade-in">
            <div
                onClick={() => onSelect(node)}
                className={`flex items-center h-9 px-4 cursor-pointer transition-all relative border-l-2 ${isSelected
                    ? "bg-blue-50 border-blue-500 text-blue-900"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                    }`}
                style={{ paddingLeft: `${depth * 16 + 16}px` }}
            >
                {/* Expansion Indicator */}
                <div className="w-5 flex shrink-0">
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                            className="p-1 rounded hover:bg-gray-200/50 transition-colors"
                        >
                            {isOpen ? (
                                <ChevronDown className={`w-3 h-3 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                            ) : (
                                <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                            )}
                        </button>
                    )}
                </div>

                {/* Type Dot */}
                <div className={`w-2 h-2 rounded-full mr-3 shrink-0 ${dotColor} shadow-[0_0_8px_rgba(0,0,0,0.05)]`} />

                {/* Name */}
                <span className={`text-[13px] font-medium truncate flex-1 ${isSelected ? 'font-semibold' : ''}`}>
                    {node.name}
                </span>

                {/* Badges */}
                <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {propCount > 0 && (
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full uppercase">
                            {propCount} props
                        </span>
                    )}
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>
                        {node.type}
                    </span>
                </div>
            </div>

            {/* Children Container with Animation */}
            {hasChildren && (
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    {node.children!.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
