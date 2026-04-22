import { ParsedPrd, ComponentNode, GenerationConfig } from './index';

/**
 * Represents the current execution state of a PRD-to-UI session.
 */
export interface SessionState {
    prdText: string;
    parsedPrd: ParsedPrd | null;
    componentTree: ComponentNode | null;
    generatedCode: Record<string, string>;
    config: GenerationConfig;
}

/**
 * An entry in the vector store for semantic retrieval of past projects.
 */
export interface VectorEntry {
    id: string;
    prdText: string;
    summary: string;
    embedding: number[];
    createdAt: string;
}

/**
 * A single thought or observation recorded by an agent.
 */
export interface ScratchpadEntry {
    agentName: string;
    thought: string;
    timestamp: string;
}

/**
 * Interface for managing the session scratchpad.
 */
export interface ScratchpadStore {
    /** Appends a new thought to the log */
    append(entry: ScratchpadEntry): void;
    /** Returns all thoughts in chronological order */
    read(): ScratchpadEntry[];
    /** Returns thoughts recorded by a specific agent */
    readByAgent(name: string): ScratchpadEntry[];
}
