import { MatchRequest, MatchResponse } from '@/shared/types/api';

/**
 * ⚠️ WARNING: 'server-only' is missing here for testing purposes.
 * Gemini AI should detect this architecture violation.
 */

export async function createMatch(req: MatchRequest): Promise<MatchResponse> {
  // Logic Risk: Should validate min/max tier order.
  console.log('Creating match with req:', req);

  // Intentional Logic Error: No validation of tiers.
  return {
    id: `match_${Math.random().toString(36).substr(2, 9)}`,
    status: 'OPEN'
  };
}
