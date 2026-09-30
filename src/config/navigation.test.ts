import { describe, expect, it } from 'vitest';
import { getVisibleNavHrefs, navigation } from './navigation';

describe('visible primary navigation', () => {
  it('exposes only chat, templates, and settings hrefs', () => {
    expect(getVisibleNavHrefs()).toEqual(['/chat', '/templates', '/settings']);
  });

  it('does not include functions or workflows entries', () => {
    const hrefs = navigation.map((item) => item.href);
    expect(hrefs).not.toContain('/functions');
    expect(hrefs).not.toContain('/workflows');
  });

  it('uses /settings as the settings item href (menu key source)', () => {
    const settings = navigation.find((item) => item.name === '设置');
    expect(settings?.href).toBe('/settings');
  });
});
