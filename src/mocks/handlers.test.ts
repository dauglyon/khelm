import { describe, it, expect } from 'vitest';

describe('MSW handlers', () => {
  it('intercepts GET /api/sessions and returns an array', async () => {
    const response = await fetch('/api/sessions');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('returns sessions with expected shape', async () => {
    const response = await fetch('/api/sessions');
    const data = await response.json();
    if (data.length > 0) {
      const session = data[0];
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('title');
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('updatedAt');
      expect(session).toHaveProperty('ownerId');
      expect(session).toHaveProperty('memberIds');
      expect(session).toHaveProperty('status');
    }
  });
});
