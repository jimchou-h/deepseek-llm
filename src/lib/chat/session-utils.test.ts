import { describe, expect, it } from 'vitest';
import {
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
