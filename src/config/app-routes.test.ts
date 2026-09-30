import { describe, expect, it } from 'vitest';
import { APP_ROUTE_PREFIXES } from './app-routes';

describe('app route reachability', () => {
  it('keeps functions and workflows reachable by direct URL', () => {
    expect(APP_ROUTE_PREFIXES).toContain('/functions');
    expect(APP_ROUTE_PREFIXES).toContain('/workflows');
  });

  it('still includes chat, templates, and settings', () => {
    expect(APP_ROUTE_PREFIXES).toEqual(
      expect.arrayContaining(['/chat', '/templates', '/settings'])
    );
  });
});
