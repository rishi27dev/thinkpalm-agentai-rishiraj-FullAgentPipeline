"use client";

import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface GenerationSkeletonProps {
    status: string;
}

export default function GenerationSkeleton({ status }: GenerationSkeletonProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-12 space-y-8 max-w-2xl mx-auto">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse" />

                {/* Main Spinner */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <Loader2 className="w-full h-full text-blue-500 animate-spin-slow stroke-[1px]" />
                    <div className="absolute inset-4 rounded-full border border-blue-100 animate-pulse" />
                    <Sparkles className="absolute w-6 h-6 text-blue-400 animate-bounce" />
                </div>
            </div>

            <div className="flex flex-col items-center space-y-3 text-center">
                <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100 animate-fade-in">
                    AI Agent Working
                </div>
                <h2 className="text-xl font-semibold text-gray-900 animate-pulse">
                    {status || "Initializing generation..."}
                </h2>
                <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                    Our AI architect is analyzing your PRD and generating an optimized component tree...
                </p>
            </div>

            {/* Skeleton Blocks */}
            <div className="w-full space-y-4 pt-4">
                <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse mx-auto" />
                <div className="h-4 bg-gray-50 rounded-full w-1/2 animate-pulse mx-auto" />
                <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse mx-auto opacity-50" />
            </div>

            {/* Steps Indicator */}
            <div className="grid grid-cols-3 gap-8 w-full max-w-md pt-8">
                {[
                    { label: "Analyzing", active: true },
                    { label: "Architecting", active: status.includes("Designing") || status.includes("Implementing") },
                    { label: "Generating", active: status.includes("Implementing") || status.includes("Finalizing") }
                ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step.active ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-100 text-gray-300'}`}>
                            {step.active ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${step.active ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
