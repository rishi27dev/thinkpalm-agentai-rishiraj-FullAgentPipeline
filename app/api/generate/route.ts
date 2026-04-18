import { NextRequest } from "next/server";
import { generateWithGroq } from "@/lib/ai/groq";
import {
    SYSTEM_PROMPT_PARSER,
    SYSTEM_PROMPT_ARCHITECT,
    SYSTEM_PROMPT_CODE_GEN,
    buildUserPrompt
} from "@/lib/ai/prompts";
import { GenerationConfig, GenerationResult, ParsedPrd, ComponentNode } from "@/types";

/**
 * Encodes a message as a Server-Sent Event (SSE) chunk
 */
function formatSSE(type: string, payload: any) {
    return `data: ${JSON.stringify({ type, payload })}\n\n`;
}

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();

    try {
        const body = await req.json();
        const { prd, config } = body as { prd: string, config: GenerationConfig };

        if (!prd || !config) {
            return new Response("Missing prd or config", { status: 400 });
        }

        const stream = new ReadableStream({
            async start(controller) {
                const send = (type: string, payload: any) => {
                    controller.enqueue(encoder.encode(formatSSE(type, payload)));
                };

                try {
                    // STEP 1: Parse PRD
                    send("status", "Analyzing requirements...");
                    const parserResponse = await generateWithGroq(
                        config.model,
                        SYSTEM_PROMPT_PARSER,
                        prd
                    );
                    const parsedPrd = JSON.parse(parserResponse) as ParsedPrd;

                    // STEP 2: Design Architecture
                    send("status", "Designing component architecture...");
                    const architectResponse = await generateWithGroq(
                        config.model,
                        SYSTEM_PROMPT_ARCHITECT,
                        JSON.stringify(parsedPrd)
                    );
                    let tree = JSON.parse(architectResponse) as ComponentNode;

                    // STEP 3: Generate Code for all nodes (recursive)
                    send("status", "Generating implementation details...");

                    const generateNodeCode = async (node: ComponentNode) => {
                        send("status", `Implementing ${node.name}...`);

                        const codeResponse = await generateWithGroq(
                            config.model,
                            SYSTEM_PROMPT_CODE_GEN,
                            `Component Hierarchy: ${node.name} (${node.type})\nPurpose: ${node.description}\nStyles: ${node.tailwindClasses.join(" ")}\n\nDesign Context: ${JSON.stringify(node)}`,
                            false
                        );

                        node.code = codeResponse;

                        if (node.children && node.children.length > 0) {
                            for (const child of node.children) {
                                await generateNodeCode(child);
                            }
                        }
                    };

                    await generateNodeCode(tree);

                    // STEP 4: Finalize
                    send("status", "Finalizing generation...");

                    const result: GenerationResult = {
                        tree,
                        metadata: {
                            totalComponents: countNodes(tree),
                            estimatedTokens: 0,
                            screens: parsedPrd.screens
                        },
                        rawPrompt: buildUserPrompt(prd, config)
                    };

                    send("result", result);
                    send("status", "Done");
                    controller.close();

                } catch (error: any) {
                    console.error("GroqServerError:", error);
                    send("error", error.message || "An unexpected error occurred during generation");
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/**
 * Utility to count total components in the tree
 */
function countNodes(node: ComponentNode): number {
    let count = 1;
    if (node.children) {
        for (const child of node.children) {
            count += countNodes(child);
        }
    }
    return count;
}
