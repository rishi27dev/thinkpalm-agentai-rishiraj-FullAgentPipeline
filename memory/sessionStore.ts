import { SessionState } from '../types/memory';

/**
 * In-process session storage for managing agent execution state.
 */
export class SessionStore {
    private sessions = new Map<string, SessionState>();

    /**
     * Initializes a new session with initial state.
     */
    create(sessionId: string, initial: Partial<SessionState>): SessionState {
        const session: SessionState = {
            prdText: initial.prdText || '',
            parsedPrd: initial.parsedPrd || null,
            componentTree: initial.componentTree || null,
            generatedCode: initial.generatedCode || {},
            config: initial.config || {
                model: 'llama-3.3-70b-versatile',
                complexity: 'standard',
                tone: 'startup',
                includeAnimations: true,
                designSystem: 'shadcn',
            },
            ...initial,
        };
        this.sessions.set(sessionId, session);
        return session;
    }

    /**
     * Retrieves session state by ID.
     */
    get(sessionId: string): SessionState | undefined {
        return this.sessions.get(sessionId);
    }

    /**
     * Updates an existing session state with a patch.
     */
    update(sessionId: string, patch: Partial<SessionState>): SessionState {
        const existing = this.sessions.get(sessionId);
        if (!existing) {
            throw new Error(`Session ${sessionId} not found`);
        }
        const updated = { ...existing, ...patch };
        this.sessions.set(sessionId, updated);
        return updated;
    }

    /**
     * Removes a session from memory.
     */
    clear(sessionId: string): void {
        this.sessions.delete(sessionId);
    }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Compatibility exports
export const getSession = (id: string) => sessionStore.get(id);
export const setSession = (id: string, state: SessionState) => {
    sessionStore.clear(id);
    sessionStore.create(id, state);
};
export const updateSession = (id: string, patch: Partial<SessionState>) => sessionStore.update(id, patch);
