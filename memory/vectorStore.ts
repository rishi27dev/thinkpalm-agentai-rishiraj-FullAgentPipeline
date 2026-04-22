import { VectorEntry } from '../types/memory';

export class VectorStore {
    private store: VectorEntry[] = [];

    constructor() {
        console.log('[VectorStore] Initialized in local keyword-search mode (Groq-compatible).');
    }

    /**
     * Mock embedding generation (returns empty, as we'll use keyword search).
     */
    async embed(text: string): Promise<number[]> {
        return [];
    }

    /**
     * Adds a new entry to the memory.
     */
    async add(prdText: string, summary: string): Promise<VectorEntry> {
        const entry: VectorEntry = {
            id: `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            prdText,
            summary,
            embedding: [], // No longer used for AI
            createdAt: new Date().toISOString(),
        };
        this.store.push(entry);
        return entry;
    }

    /**
     * Performs a keyword-based search as a fallback for embeddings.
     */
    async search(queryText: string, topK: number = 5): Promise<VectorEntry[]> {
        const queryTerms = new Set(queryText.toLowerCase().split(/\W+/).filter(t => t.length > 3));

        const results = this.store
            .map((entry) => {
                const entryTerms = new Set((entry.prdText + " " + entry.summary).toLowerCase().split(/\W+/));
                let matches = 0;
                queryTerms.forEach(term => {
                    if (entryTerms.has(term)) matches++;
                });
                return {
                    entry,
                    similarity: matches / (queryTerms.size || 1)
                };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK)
            .map((r) => r.entry);

        return results;
    }
}

// Export singleton instance for app-wide use
export const vectorStore = new VectorStore();

// Legacy alias for compatibility
export const addEntry = (entry: VectorEntry) => {
    // This is different from the new class interface but kept for basic type compatibility if needed
    console.warn('[VectorStore] addEntry is deprecated. Use vectorStore.add()');
};
export const searchEntries = (query: string, limit: number) => vectorStore.search(query, limit);
