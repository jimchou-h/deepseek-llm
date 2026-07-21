import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONTEXT_MESSAGE_LIMIT,
  buildApiMessages,
  normalizeContextMessageLimit,
} from './context-window';
import type { Message } from '@/types';

const msg = (role: Message['role'], content: string, timestamp: number): Message => ({
  role,
  content,
  timestamp,
});

describe('normalizeContextMessageLimit', () => {
  it('defaults invalid values to 50', () => {
    expect(normalizeContextMessageLimit(Number.NaN)).toBe(DEFAULT_CONTEXT_MESSAGE_LIMIT);
  });

  it('enforces minimum of 1', () => {
    expect(normalizeContextMessageLimit(0)).toBe(1);
    expect(normalizeContextMessageLimit(-3)).toBe(1);
  });
});

describe('buildApiMessages', () => {
  it('uses newest N messages without counting system toward N', () => {
    const messages = Array.from({ length: 5 }, (_, i) =>
      msg(i % 2 === 0 ? 'user' : 'assistant', `m${i}`, i + 1)
    );
    const result = buildApiMessages({
      systemPrompt: '你是助手',
      messages,
      limit: 2,
    });
    expect(result[0]).toEqual({ role: 'system', content: '你是助手', timestamp: 0 });
    expect(result.slice(1).map((m) => m.content)).toEqual(['m3', 'm4']);
  });

  it('includes all messages when shorter than limit', () => {
    const messages = [msg('user', 'hi', 1), msg('assistant', 'hello', 2)];
    const result = buildApiMessages({
      messages,
      limit: 50,
    });
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.content)).toEqual(['hi', 'hello']);
  });

  it('defaults limit behavior to 50 when building with default constant', () => {
    const messages = Array.from({ length: 60 }, (_, i) =>
      msg('user', `u${i}`, i + 1)
    );
    const result = buildApiMessages({
      messages,
      limit: DEFAULT_CONTEXT_MESSAGE_LIMIT,
    });
    expect(result).toHaveLength(50);
    expect(result[0].content).toBe('u10');
    expect(result[49].content).toBe('u59');
  });
});
