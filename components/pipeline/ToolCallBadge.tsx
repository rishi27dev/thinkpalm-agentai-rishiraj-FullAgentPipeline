import React, { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { ToolCall } from '@/types/agents';

interface ToolCallBadgeProps {
    call: ToolCall;
}

const ToolCallBadge: React.FC<ToolCallBadgeProps> = ({ call }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="inline-block mt-1">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[10px] font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            >
                <Wrench size={10} />
                <span>{call.toolName}</span>
                <span className="text-amber-400">({call.durationMs}ms)</span>
                {call.error ? <X size={10} className="text-red-500" /> : <Check size={10} className="text-green-500" />}
                {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>

            {expanded && (
                <div className="mt-2 p-3 bg-gray-900 rounded-lg text-[10px] font-mono text-gray-300 overflow-x-auto border border-gray-800 shadow-xl max-w-xl">
                    <div className="mb-2">
                        <span className="text-blue-400 font-bold italic mr-2">// Input</span>
                        <pre className="whitespace-pre-wrap mt-1">{JSON.stringify(call.input, null, 2)}</pre>
                    </div>
                    <div>
                        <span className="text-green-400 font-bold italic mr-2">// Output</span>
                        <pre className="whitespace-pre-wrap mt-1">{JSON.stringify(call.output, null, 2)}</pre>
                    </div>
                    {call.error && (
                        <div className="mt-2 text-red-400">
                            <span className="font-bold italic mr-2">// Error</span>
                            <p>{call.error}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ToolCallBadge;
