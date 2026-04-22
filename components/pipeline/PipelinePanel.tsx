import React, { useState, useEffect, useCallback, useImperativeHandle } from 'react';
import AgentCard from './AgentCard';
import ThoughtLog from './ThoughtLog';
import PipelineControls from './PipelineControls';
import { PipelineEvent, AgentResult, PipelineRun } from '@/types/agents';
import { GenerationConfig, GenerationResult } from '@/types';

const simpleId = () => Math.random().toString(36).substring(2, 10);
const toAgentKey = (agentName: string): 'analyst' | 'architect' | 'codegen' | 'reviewer' | 'orchestrator' => {
    const value = agentName.toLowerCase();
    if (value.includes('analyst')) return 'analyst';
    if (value.includes('architect')) return 'architect';
    if (value.includes('codegen')) return 'codegen';
    if (value.includes('reviewer')) return 'reviewer';
    return 'orchestrator';
};

interface PipelinePanelProps {
    prd: string;
    config: GenerationConfig;
    onComplete: (result: GenerationResult) => void;
    isGenerating: boolean;
    setIsGenerating: (val: boolean) => void;
}

const PipelinePanel = React.forwardRef<{ triggerRun: () => void }, PipelinePanelProps>(
    ({ prd, config, onComplete, isGenerating, setIsGenerating }, ref) => {
        const [sessionId, setSessionId] = useState<string>('');
        const [runId, setRunId] = useState<string | undefined>();
        const [events, setEvents] = useState<PipelineEvent[]>([]);
        const [agentStatuses, setAgentStatuses] = useState<Record<string, 'idle' | 'running' | 'done' | 'error'>>({
            analyst: 'idle',
            architect: 'idle',
            codegen: 'idle',
            reviewer: 'idle'
        });
        const [metrics, setMetrics] = useState<Record<string, { durationMs?: number; tokensUsed?: number; toolCalls?: any[] }>>({});

        // Initialize Session
        useEffect(() => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('pipeline_session_id');
                const id = saved || `session_${simpleId()}`;
                setSessionId(id);
                if (!saved) localStorage.setItem('pipeline_session_id', id);
            }
        }, []);

        const handleRun = useCallback(async () => {
            if (!prd.trim()) return;

            setIsGenerating(true);
            setEvents([]);
            setAgentStatuses({ analyst: 'idle', architect: 'idle', codegen: 'idle', reviewer: 'idle' });
            setMetrics({});

            try {
                const response = await fetch('/api/pipeline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prdText: prd, sessionId, config }),
                });

                if (!response.ok) throw new Error('Failed to start pipeline');
                if (!response.body) throw new Error('No stream available');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulated = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    accumulated += decoder.decode(value, { stream: true });
                    const lines = accumulated.split('\n\n');
                    accumulated = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6).trim();
                            if (dataStr === '[DONE]') {
                                setIsGenerating(false);
                                continue;
                            }

                            const event: PipelineEvent = JSON.parse(dataStr);
                            setEvents(prev => [...prev, event]);

                            // Dispatch to local state
                            if (event.type === 'agent_start') {
                                const key = toAgentKey(event.agent);
                                setAgentStatuses(prev => ({ ...prev, [key]: 'running' }));
                                setRunId(event.timestamp);
                            } else if (event.type === 'agent_done') {
                                const key = toAgentKey(event.result.agentName);
                                setAgentStatuses(prev => ({ ...prev, [key]: 'done' }));
                                setMetrics(prev => ({
                                    ...prev,
                                    [key]: {
                                        durationMs: event.result.durationMs,
                                        tokensUsed: event.result.tokensUsed,
                                        toolCalls: event.result.toolCalls
                                    }
                                }));
                            } else if (event.type === 'error') {
                                const key = toAgentKey(event.agent);
                                if (key !== 'orchestrator') {
                                    setAgentStatuses(prev => ({ ...prev, [key]: 'error' }));
                                }
                                setIsGenerating(false);
                            } else if (event.type === 'done') {
                                setRunId(event.run.id);
                                onComplete(event.run.finalOutput);
                                setIsGenerating(false);
                            }
                        }
                    }
                }
            } catch (err: any) {
                console.error(err);
                setEvents(prev => [...prev, { type: 'error', agent: 'orchestrator', message: err.message, timestamp: new Date().toISOString() } as any]);
                setIsGenerating(false);
            }
        }, [prd, sessionId, config, onComplete, setIsGenerating]);

        // Expose triggerRun to parent
        useImperativeHandle(ref, () => ({
            triggerRun: handleRun
        }));

        const handleCancel = async () => {
            if (!runId) return;
            try {
                await fetch('/api/pipeline/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ runId }),
                });
            } catch (err) {
                console.error('Cancel failed', err);
            }
        };

        return (
            <div className="flex flex-col gap-6 p-6 h-full max-h-[800px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Agents */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Agent Status</h3>
                        {(['analyst', 'architect', 'codegen', 'reviewer'] as const).map(agent => (
                            <AgentCard
                                key={agent}
                                name={agent}
                                status={agentStatuses[agent]}
                                durationMs={metrics[agent]?.durationMs}
                                tokensUsed={metrics[agent]?.tokensUsed}
                                toolCalls={metrics[agent]?.toolCalls}
                            />
                        ))}
                        <div className="mt-8">
                            <PipelineControls
                                sessionId={sessionId}
                                runId={runId}
                                onRun={handleRun}
                                onCancel={handleCancel}
                                isGenerating={isGenerating}
                            />
                        </div>
                    </div>

                    {/* Right Column: Thought Log */}
                    <div className="h-full">
                        <ThoughtLog events={events} onClear={() => setEvents([])} />
                    </div>
                </div>
            </div>
        );
    }
);

export default PipelinePanel;
