/**
 * Trigger Priority Resolver
 * 
 * Logic to determine the best matching trigger for a given message.
 * Priority: 1. Exact Case-Insensitive Match
 *           2. Longest Keyword Match (Most specific)
 */

export interface KeywordTrigger {
    keyword: string;
    response: string;
}

/**
 * Finds the best matching trigger for a user message.
 * @param message The raw incoming message from the user
 * @param triggers List of keyword-response pairs
 * @returns The best response string or null if no match
 */
export function findBestTriggerMatch(message: string, triggers: KeywordTrigger[]): string | null {
    if (!message || !triggers || triggers.length === 0) return null;

    const lowerMessage = message.trim().toLowerCase();
    let bestMatch: KeywordTrigger | null = null;

    for (const trigger of triggers) {
        if (!trigger.keyword || !trigger.response) continue;

        const lowerKeyword = trigger.keyword.trim().toLowerCase();

        // 1. Exact Match Check
        if (lowerMessage === lowerKeyword) {
            // Exact match is the ultimate priority, return immediately
            return trigger.response;
        }

        // 2. Partial Inclusion Check
        if (lowerMessage.includes(lowerKeyword)) {
            // If we find a new match, compare specificity (length)
            if (!bestMatch || lowerKeyword.length > bestMatch.keyword.length) {
                bestMatch = trigger;
            }
        }
    }

    return bestMatch ? bestMatch.response : null;
}

export interface TriggerConflict {
    type: 'DUPLICATE' | 'OVERLAP';
    keyword: string;
    relatedKeyword?: string;
    message: string;
}

/**
 * Detects conflicts in a list of triggers.
 * - DUPLICATE: Same keyword
 * - OVERLAP: One keyword is a substring of another (informed by priority rules)
 */
export function detectConflicts(triggers: KeywordTrigger[]): TriggerConflict[] {
    const conflicts: TriggerConflict[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < triggers.length; i++) {
        const k1 = triggers[i].keyword?.trim().toLowerCase();
        if (!k1) continue;

        // Check for duplicates
        if (seen.has(k1)) {
            conflicts.push({
                type: 'DUPLICATE',
                keyword: triggers[i].keyword,
                message: `Duplicate keyword: "${triggers[i].keyword}" is used multiple times.`
            });
        }
        seen.add(k1);

        // Check for overlaps with other keywords
        for (let j = 0; j < triggers.length; j++) {
            if (i === j) continue;
            const k2 = triggers[j].keyword?.trim().toLowerCase();
            if (!k2) continue;

            if (k1 !== k2 && k1.includes(k2)) {
                conflicts.push({
                    type: 'OVERLAP',
                    keyword: triggers[i].keyword,
                    relatedKeyword: triggers[j].keyword,
                    message: `Overlap detected: "${triggers[i].keyword}" includes "${triggers[j].keyword}". Use specific keywords wisely.`
                });
            }
        }
    }

    return conflicts;
}
