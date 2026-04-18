"use client";

import { Cpu, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { GenerationConfig } from "@/types";

interface PromptConfigProps {
    config: GenerationConfig;
    setConfig: (config: GenerationConfig) => void;
}

export default function PromptConfig({ config, setConfig }: PromptConfigProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const updateConfig = (key: keyof GenerationConfig, value: any) => {
        setConfig({ ...config, [key]: value });
    };

    return (
        <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50/30">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-100/50 transition-colors"
            >
                <div className="flex items-center space-x-2 text-gray-600">
                    <Cpu className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Configuration</span>
                </div>
                {isCollapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
            </button>

            {!isCollapsed && (
                <div className="p-4 space-y-4 border-t border-gray-100 bg-white">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Model</label>
                        <select
                            value={config.model}
                            onChange={(e) => updateConfig("model", e.target.value)}
                            className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-black outline-none appearance-none"
                        >
                            <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                            <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                            <option value="gemma2-9b-it">Gemma 2 9B</option>
                            <option value="gpt-4o">GPT-4o</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Complexity</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['minimal', 'standard', 'detailed'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => updateConfig("complexity", level)}
                                    className={`py-1.5 text-xs border rounded-md capitalize transition-all ${config.complexity === level ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200 hover:border-black"
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tone</label>
                        <select
                            value={config.tone}
                            onChange={(e) => updateConfig("tone", e.target.value)}
                            className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-black outline-none appearance-none"
                        >
                            <option value="corporate">Corporate</option>
                            <option value="startup">Startup</option>
                            <option value="playful">Playful</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-medium text-gray-700">Include Animations</span>
                        <button
                            onClick={() => updateConfig("includeAnimations", !config.includeAnimations)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${config.includeAnimations ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.includeAnimations ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
