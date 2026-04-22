import { NextRequest, NextResponse } from 'next/server';
import { runPipeline, getPipelineStatus } from '@/agents/orchestrator';
import { PipelineInput } from '@/types/agents';
import { GenerationConfig } from '@/types';
import { resolveAppModel } from '@/lib/ai/provider';

/**
 * GET /api/pipeline?runId=xxx
 * Returns the current status of a pipeline run.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');

    if (!runId) {
        return NextResponse.json({ error: 'runId parameter is required' }, { status: 400 });
    }

    const status = getPipelineStatus(runId);
    if (!status) {
        return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 });
    }

    return NextResponse.json(status);
}

/**
 * POST /api/pipeline
 * Starts a new pipeline and streams events via Server-Sent Events (SSE).
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prdText, sessionId, config } = body;

        // Validation
        if (!prdText || typeof prdText !== 'string' || prdText.trim().length === 0) {
            return NextResponse.json({ error: 'prdText must be a non-empty string' }, { status: 400 });
        }
        if (!sessionId || typeof sessionId !== 'string') {
            return NextResponse.json({ error: 'sessionId must be a string' }, { status: 400 });
        }

        const input: PipelineInput = { prdText, sessionId };
        const baseConfig: GenerationConfig = config || {
            model: 'llama-3.3-70b-versatile',
            complexity: 'standard',
            tone: 'startup',
            includeAnimations: true,
            designSystem: 'shadcn',
        };
        const genConfig: GenerationConfig = {
            ...baseConfig,
            model: resolveAppModel(baseConfig.model),
        };

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                const send = (data: any) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                };

                try {
                    for await (const event of runPipeline(input, genConfig)) {
                        send(event);
                    }
                    // Signal completion
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                } catch (err: any) {
                    console.error('[API: Pipeline] Stream error:', err);
                    send({ type: 'error', message: err.message || 'Unknown stream error' });
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });

    } catch (error: unknown) {
        console.error('[API: Pipeline] POST error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
