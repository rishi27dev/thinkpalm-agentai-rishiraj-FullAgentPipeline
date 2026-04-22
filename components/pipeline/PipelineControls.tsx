import React from 'react';
import { Play, Square, Hash, Save } from 'lucide-react';

interface PipelineControlsProps {
    sessionId: string;
    runId?: string;
    onRun: () => void;
    onCancel: () => void;
    isGenerating: boolean;
}

const PipelineControls: React.FC<PipelineControlsProps> = ({ sessionId, runId, onRun, onCancel, isGenerating }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 text-gray-400 rounded-lg">
                        <Hash size={14} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Session ID</div>
                        <div className="text-xs font-mono font-semibold text-gray-700">{sessionId}</div>
                    </div>
                </div>

                {runId && (
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 text-gray-400 rounded-lg">
                            <Save size={14} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Active Run</div>
                            <div className="text-xs font-mono font-semibold text-gray-700">{runId}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {isGenerating ? (
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all rounded-lg text-sm font-bold border border-red-100"
                    >
                        <Square size={16} fill="currentColor" />
                        Cancel Run
                    </button>
                ) : (
                    <button
                        onClick={onRun}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all rounded-lg text-sm font-bold shadow-lg shadow-blue-200"
                    >
                        <Play size={16} fill="currentColor" />
                        Launch Pipeline
                    </button>
                )}
            </div>
        </div>
    );
};

export default PipelineControls;
