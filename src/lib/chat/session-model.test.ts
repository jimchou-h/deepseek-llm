import { describe, expect, it } from 'vitest';
import { resolveSessionModel } from './session-model';

describe('resolveSessionModel', () => {
  it('prefers the explicit session model', () => {
    expect(resolveSessionModel('flash', 'pro')).toBe('flash');
    expect(resolveSessionModel('pro', 'flash')).toBe('pro');
  });

  it('falls back to the global model when the session has no override', () => {
    expect(resolveSessionModel(undefined, 'pro')).toBe('pro');
    expect(resolveSessionModel(undefined, 'flash')).toBe('flash');
  });
});
