import { describe, expect, it } from 'vitest';
import {
  createEmptySession,
  migrateLegacyChatState,
  titleAfterFirstUserMessage,
  truncateTitle,
  DEFAULT_SESSION_TITLE,
} from './session-utils';
import type { Message } from '@/types';

const user = (content: string, timestamp = 1): Message => ({
  role: 'user',
  content,
  timestamp,
});

const assistant = (content: string, timestamp = 2): Message => ({
  role: 'assistant',
  content,
  timestamp,
});

describe('truncateTitle', () => {
  it('returns default for blank content', () => {
    expect(truncateTitle('   ')).toBe(DEFAULT_SESSION_TITLE);
  });

  it('keeps short titles', () => {
    expect(truncateTitle('你好世界')).toBe('你好世界');
  });

  it('truncates long titles with ellipsis', () => {
    const long = '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十超出';
    expect(truncateTitle(long).endsWith('…')).toBe(true);
    expect(truncateTitle(long).length).toBe(31);
  });
});

describe('migrateLegacyChatState', () => {
  it('wraps legacy messages into one active session', () => {
    const messages = [user('旧消息'), assistant('回复')];
    const result = migrateLegacyChatState({ messages }, 1000);
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0].messages).toEqual(messages);
    expect(result.activeSessionId).toBe(result.sessions[0].id);
    expect(result.sessions[0].title).toBe('旧消息');
  });

  it('preserves existing sessions shape', () => {
    const session = createEmptySession(1);
    session.messages = [user('已有')];
    const result = migrateLegacyChatState({
      sessions: [session],
      activeSessionId: session.id,
    });
    expect(result.sessions).toEqual([session]);
    expect(result.activeSessionId).toBe(session.id);
  });
});

describe('titleAfterFirstUserMessage', () => {
  it('sets title from first user message only', () => {
    expect(titleAfterFirstUserMessage(DEFAULT_SESSION_TITLE, [], user('第一句'))).toBe(
      '第一句'
    );
    expect(
      titleAfterFirstUserMessage('第一句', [user('第一句')], user('第二句'))
    ).toBe('第一句');
  });
});
