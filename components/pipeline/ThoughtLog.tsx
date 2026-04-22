import React, { useRef, useEffect } from 'react';
import { PipelineEvent } from '@/types/agents';
import ToolCallBadge from './ToolCallBadge';
import { Trash2 } from 'lucide-react';

interface ThoughtLogProps {
    events: PipelineEvent[];
    onClear: () => void;
}

const ThoughtLog: React.FC<ThoughtLogProps> = ({ events, onClear }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    const renderEvent = (event: PipelineEvent, index: number) => {
        switch (event.type) {
            case 'agent_start':
                return (
                    <div key={index} className="border-l-2 border-blue-500 pl-3 py-1 my-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mr-2">Agent Start</span>
                        <span className="text-sm font-semibold text-gray-900">{event.agent}</span>
                    </div>
                );
            case 'agent_done':
                return (
                    <div key={index} className="border-l-2 border-green-500 pl-3 py-1 my-1">
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest mr-2">Agent Done</span>
                        <span className="text-xs text-gray-500 italic">Phase completed successfully</span>
                    </div>
                );
            case 'tool_call':
                return (
                    <div key={index} className="border-l-2 border-amber-500 pl-3 py-1 my-1">
                        <ToolCallBadge call={event.call} />
                    </div>
                );
            case 'thought':
                return (
                    <div key={index} className="border-l-2 border-gray-300 pl-3 py-1 my-1">
                        <p className="text-xs text-gray-600 leading-relaxed">{event.text}</p>
                    </div>
                );
            case 'error':
                return (
                    <div key={index} className="border-l-2 border-red-500 pl-3 py-1 my-1 bg-red-50/50 rounded-r">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-0.5">Error in {event.agent}</span>
                        <p className="text-xs text-red-700 font-medium">{event.message}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    Agent Logs & Thoughts
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </h3>
                <button
                    onClick={onClear}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors rounded-lg"
                    title="Clear logs"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar scroll-smooth"
            >
                {events.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-300 text-xs italic">
                        Waiting for pipeline events...
                    </div>
                ) : (
                    events.map((e, i) => renderEvent(e, i))
                )}
            </div>
        </div>
    );
};

export default ThoughtLog;
