import { describe, expect, it } from 'vitest';
import { buildMessageListItems, messageListItemKey } from './message-list-items';
import type { Message } from '@/types';

const msg = (content: string, timestamp: number): Message => ({
  role: 'user',
  content,
  timestamp,
});

describe('buildMessageListItems', () => {
  it('appends a streaming row without duplicating completed messages', () => {
    const items = buildMessageListItems({
      messages: [msg('hi', 1)],
      streamingContent: 'partial',
      streamingReasoning: null,
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
    });
    expect(items).toHaveLength(1);
  });
});
