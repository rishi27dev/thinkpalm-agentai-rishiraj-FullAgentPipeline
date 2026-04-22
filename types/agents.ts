import { GenerationResult, GenerationConfig } from './index';
import { SessionState, ScratchpadStore } from './memory';

/**
 * Simple JSON Schema representation for tool input/output validation.
 */
export type JSONSchema = {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  properties?: Record<string, unknown>;
  required?: string[];
  items?: unknown;
  description?: string;
  [key: string]: unknown;
};

/**
 * Definition of a tool that can be used by agents.
 */
export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  execute: (input: TInput, ctx: AgentContext) => Promise<TOutput>;
}

/**
 * Record of a tool execution within an agent's run.
 */
export interface ToolCall {
  toolName: string;
  input: unknown;
  output: unknown;
  durationMs: number;
  error?: string;
}

/**
 * Context provided to an agent during execution.
 */
export interface AgentContext {
  sessionId: string;
  pipelineRunId: string;
  session: SessionState;
  scratchpad: ScratchpadStore;
  tools: Map<string, ToolDefinition<any, any>>;
  orchestrator: {
    runRevision: (issues: ReviewIssue[]) => Promise<AgentResult>;
  };
  emit: (event: PipelineEvent) => void;
}

/**
 * A specific issue found during code review.
 */
export interface ReviewIssue {
  component: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

/**
 * Structured report returned by the reviewer agent.
 */
export interface ReviewReport {
  overallScore: number;
  issues: ReviewIssue[];
  suggestions: string[];
  approved: boolean;
}

/**
 * The outcome of an individual agent's execution phase.
 */
export interface AgentResult {
  agentName: string;
  success: boolean;
  output: unknown;
  toolCalls: ToolCall[];
  thoughtLog: string[];
  durationMs: number;
  tokensUsed: number;
}

/**
 * Discriminated union of all events that can occur during a pipeline run.
 */
export type PipelineEvent =
  | { type: 'agent_start'; agent: string; timestamp: string }
  | { type: 'agent_done'; result: AgentResult }
  | { type: 'tool_call'; call: ToolCall }
  | { type: 'thought'; agent: string; text: string }
  | { type: 'error'; agent: string; message: string }
  | { type: 'done'; run: PipelineRun };

/**
 * Input format for the master pipeline.
 */
export interface PipelineInput {
  prdText: string;
  sessionId: string;
}


/**
 * The final report of a completed pipeline execution.
 */
export interface PipelineRun {
  id: string;
  startedAt: string;
  completedAt: string;
  agents: AgentResult[];
  finalOutput: GenerationResult;
}

/**
 * Custom error thrown by tools when execution fails.
 */
export class ToolError extends Error {
  constructor(message: string, public data?: unknown) {
    super(message);
    this.name = 'ToolError';
  }
}
