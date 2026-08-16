import { describe, expect, it } from 'vitest';
import { buildMessageListItems, messageListItemKey } from './message-list-items';
import type { Message } from '@/types';

const msg = (content: string, timestamp: number): Message => ({
  role: 'user',
  content,
  timestamp,
});

const assistant = (content: string, timestamp: number): Message => ({
  role: 'assistant',
  content,
  timestamp,
});

describe('buildMessageListItems', () => {
  it('appends a streaming row without duplicating completed messages', () => {
    const items = buildMessageListItems({
      messages: [msg('hi', 1)],
      streamingContent: 'partial',
      streamingReasoning: null,
      isLoading: true,
    });
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ kind: 'message', message: msg('hi', 1) });
    expect(items[1]).toEqual({
      kind: 'streaming',
      content: 'partial',
      reasoning: null,
    });
    expect(messageListItemKey(items[1], 1)).toBe('streaming');
  });

  it('omits streaming row when idle', () => {
    const items = buildMessageListItems({
      messages: [msg('hi', 1)],
      streamingContent: null,
      streamingReasoning: null,
      isLoading: false,
    });
    expect(items).toHaveLength(1);
  });

  it('omits streaming row when not loading even if leftover streaming strings remain', () => {
    const items = buildMessageListItems({
      messages: [msg('hi', 1), assistant('done', 2)],
      streamingContent: 'done',
      streamingReasoning: 'thought',
      isLoading: false,
    });
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.kind === 'message')).toBe(true);
  });

  it('appends exactly one streaming row while loading', () => {
    const items = buildMessageListItems({
      messages: [msg('hi', 1)],
      streamingContent: 'partial',
      streamingReasoning: null,
      isLoading: true,
    });
    expect(items.filter((item) => item.kind === 'streaming')).toHaveLength(1);
  });
});
