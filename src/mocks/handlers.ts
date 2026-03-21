import { getSessionsMock } from '@/generated/api/sessions/sessions.msw';

/**
 * Custom MSW handlers that override generated ones.
 * Listed last so they take precedence.
 */
const customHandlers: ReturnType<typeof getSessionsMock> = [];

/**
 * Aggregated handlers: generated first, custom overrides last.
 */
export const handlers = [...getSessionsMock(), ...customHandlers];
