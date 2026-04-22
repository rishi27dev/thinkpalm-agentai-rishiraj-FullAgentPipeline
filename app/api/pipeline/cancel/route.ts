import { NextRequest, NextResponse } from 'next/server';
import { cancelPipeline } from '@/agents/orchestrator';

/**
 * POST /api/pipeline/cancel
 * Accepts { runId: string } and sets the cancellation flag for that run.
 */
export async function POST(req: NextRequest) {
    try {
        const { runId } = await req.json();

        if (!runId || typeof runId !== 'string') {
            return NextResponse.json({ error: 'runId must be a non-empty string' }, { status: 400 });
        }

        cancelPipeline(runId);

        return NextResponse.json({ cancelled: true });
    } catch (error: unknown) {
        console.error('[API: Cancel] Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
