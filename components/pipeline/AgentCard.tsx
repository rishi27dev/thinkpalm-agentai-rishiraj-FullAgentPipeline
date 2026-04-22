import React from 'react';
import { Cpu, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ToolCall } from '@/types/agents';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AgentCardProps {
    name: string;
    status: 'idle' | 'running' | 'done' | 'error';
    durationMs?: number;
    tokensUsed?: number;
    toolCalls?: ToolCall[];
}

const AgentCard: React.FC<AgentCardProps> = ({ name, status, durationMs, tokensUsed, toolCalls = [] }) => {
    const isRunning = status === 'running';
    const isDone = status === 'done';
    const isError = status === 'error';

    return (
        <div className={cn(
            "p-4 rounded-xl border transition-all duration-300",
            isRunning ? "bg-blue-50/50 border-blue-200 shadow-sm" :
                isDone ? "bg-green-50/30 border-green-100" :
                    isError ? "bg-red-50/50 border-red-200" :
                        "bg-white border-gray-100"
        )}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-1.5 rounded-lg",
                        isRunning ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                        <Cpu size={16} />
                    </div>
                    <h4 className="font-semibold text-sm capitalize">{name}</h4>
                </div>

                <div className="flex items-center gap-2">
                    {isRunning && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <Loader2 size={10} className="animate-spin" />
                            Running
                        </div>
                    )}
                    {isDone && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={10} />
                            Done
                        </div>
                    )}
                    {isError && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <AlertCircle size={10} />
                            Error
                        </div>
                    )}
                    {!isRunning && !isDone && !isError && (
                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Idle</div>
                    )}
                </div>
            </div>

            {(isDone || isRunning) && (
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                        <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Time</div>
                        <div className="text-xs font-mono font-medium text-gray-700">
                            {durationMs ? `${durationMs}ms` : '---'}
                        </div>
                    </div>
                    <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                        <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Tokens</div>
                        <div className="text-xs font-mono font-medium text-gray-700">
                            {tokensUsed ?? '---'}
                        </div>
                    </div>
                    <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                        <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Tools</div>
                        <div className="text-xs font-mono font-medium text-gray-700">
                            {toolCalls.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentCard;
