import { ScratchpadEntry, ScratchpadStore as IScratchpadStore } from '../types/memory';

/**
 * Implementation of the ScratchpadStore interface for managing agent thoughts.
 */
export class ScratchpadStore implements IScratchpadStore {
    private entries: ScratchpadEntry[] = [];

    constructor(private sessionId: string) { }

    append(entry: ScratchpadEntry): void {
        this.entries.push(entry);
    }

    read(): ScratchpadEntry[] {
        return [...this.entries];
    }

    readByAgent(name: string): ScratchpadEntry[] {
        return this.entries.filter((e) => e.agentName === name);
    }
}

/**
 * Factory for creating a new scratchpad store instance for a session.
 */
export const createScratchpad = (sessionId: string): IScratchpadStore => {
    return new ScratchpadStore(sessionId);
};

// Alias for orchestrator compatibility
export const createScratchpadStore = createScratchpad;
