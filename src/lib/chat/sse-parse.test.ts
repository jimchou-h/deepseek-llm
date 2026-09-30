import { describe, expect, it } from 'vitest';
import { appendSseText } from './sse-parse';

describe('appendSseText', () => {
  it('keeps a partial event in the buffer', () => {
    const first = appendSseText('', 'data: {"x":1}');
    expect(first.dataPayloads).toEqual([]);
    expect(first.buffer).toBe('data: {"x":1}');

    const second = appendSseText(first.buffer, '\n\n');
    expect(second.dataPayloads).toEqual(['{"x":1}']);
    expect(second.buffer).toBe('');
  });

  it('yields multiple events from one chunk', () => {
    const result = appendSseText(
      '',
      'data: {"a":1}\n\ndata: {"b":2}\n\n'
    );
    expect(result.dataPayloads).toEqual(['{"a":1}', '{"b":2}']);
    expect(result.sawDone).toBe(false);
  });

  it('detects [DONE]', () => {
    const result = appendSseText('', 'data: [DONE]\n\n');
    expect(result.dataPayloads).toEqual([]);
    expect(result.sawDone).toBe(true);
  });
});

describe('TextDecoder stream mode (multi-byte)', () => {
  it('does not corrupt a Chinese character split across chunks', () => {
    const decoder = new TextDecoder();
    const bytes = new TextEncoder().encode('你好世界');
    const mid = 4; // 拆在多字节中间附近
    const part1 = decoder.decode(bytes.slice(0, mid), { stream: true });
    const part2 = decoder.decode(bytes.slice(mid), { stream: true });
    expect(part1 + part2).toBe('你好世界');
  });
});
