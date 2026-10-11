import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chatCompletion } from './deepseek';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const API_KEY = `sk-${'0'.repeat(32)}`;

type Captured = { url?: string; body?: Record<string, unknown> };

function captureFetch(): Captured {
  const captured: Captured = {};
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    captured.url = url;
    captured.body = JSON.parse(String(init.body)) as Record<string, unknown>;
    return new Response(new ReadableStream({ start(c) { c.close(); } }), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return captured;
}

const makeSettings = (model: 'pro' | 'flash') => ({
  model,
  temperature: 0.7,
  systemPrompt: '',
  functions: [],
});

const messages: ChatCompletionMessageParam[] = [
  { role: 'user', content: 'hi' },
];

describe('deepseek.chatCompletion model routing', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends deepseek-v4-flash when settings.model is flash', async () => {
    const captured = captureFetch();
    await chatCompletion(messages, makeSettings('flash'), API_KEY);
    expect(captured.body?.model).toBe('deepseek-v4-flash');
  });

  it('sends deepseek-v4-pro when settings.model is pro', async () => {
    const captured = captureFetch();
    await chatCompletion(messages, makeSettings('pro'), API_KEY);
    expect(captured.body?.model).toBe('deepseek-v4-pro');
  });

  it('explicit model parameter overrides settings.model', async () => {
    const captured = captureFetch();
    await chatCompletion(messages, makeSettings('pro'), API_KEY, undefined, undefined, undefined, 'flash');
    expect(captured.body?.model).toBe('deepseek-v4-flash');
  });

  it('caps generation with max_tokens 8192', async () => {
    const captured = captureFetch();
    await chatCompletion(messages, makeSettings('pro'), API_KEY);
    expect(captured.body?.max_tokens).toBe(8192);
  });

  it('no longer rejects adjacent same-role messages (reasoner validation removed)', async () => {
    const captured = captureFetch();
    const adjacent: ChatCompletionMessageParam[] = [
      { role: 'user', content: 'a' },
      { role: 'user', content: 'b' },
    ];
    await expect(
      chatCompletion(adjacent, makeSettings('pro'), API_KEY)
    ).resolves.toHaveProperty('status');
  });
});
