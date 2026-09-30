import { Settings } from '@/types';
import { API_CONFIG } from './config';
import { appendSseText } from '@/lib/chat/sse-parse';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const CHAT_COMPLETIONS_URL = 'https://api.deepseek.com/chat/completions';

export type ChatCompletionStatus = 'completed' | 'aborted' | 'incomplete';

export type ChatCompletionResult = {
  content: string;
  reasoningContent: string;
  status: ChatCompletionStatus;
};

export type ChatCompletionHandlers = {
  onStream?: (delta: string) => void;
  onStreamReasoning?: (delta: string) => void;
  signal?: AbortSignal;
};

function validateMessages(messages: ChatCompletionMessageParam[], model: string) {
  if (model === 'deepseek-reasoner') {
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].role === messages[i - 1].role) {
        throw new Error(
          '使用 deepseek-reasoner 模型时，消息序列中的用户和助手消息必须交替出现'
        );
      }
    }
  }
}

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = (error as { name?: string }).name;
  return name === 'AbortError';
}

type DeltaSink = {
  content: string;
  reasoningContent: string;
  sawDone: boolean;
};

/**
 * 从 ReadableStream 读 SSE：stream decode → buffer 拼事件 → JSON delta。
 * 返回时带上完成语义（completed / aborted / incomplete）。
 */
async function readChatSseStream(
  body: ReadableStream<Uint8Array>,
  handlers: ChatCompletionHandlers,
  initial?: { content?: string; reasoningContent?: string }
): Promise<DeltaSink & { status: ChatCompletionStatus }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = initial?.content ?? '';
  let reasoningContent = initial?.reasoningContent ?? '';
  let sawDone = false;

  try {
    while (true) {
      if (handlers.signal?.aborted) {
        return { content, reasoningContent, sawDone, status: 'aborted' };
      }

      const { done, value } = await reader.read();
      if (done) {
        // 连接结束时若最后一帧缺空行，补一次边界以免丢最后一条 data
        if (buffer.trim()) {
          const flushed = appendSseText(buffer, '\n\n');
          buffer = flushed.buffer;
          if (flushed.sawDone) sawDone = true;
          for (const payload of flushed.dataPayloads) {
            try {
              const json = JSON.parse(payload) as {
                choices?: Array<{
                  delta?: { content?: string; reasoning_content?: string };
                }>;
              };
              const delta = json.choices?.[0]?.delta;
              if (delta?.content) {
                content += delta.content;
                handlers.onStream?.(delta.content);
              }
              if (delta?.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                handlers.onStreamReasoning?.(delta.reasoning_content);
              }
            } catch {
              // ignore
            }
          }
        }
        break;
      }

      // stream:true 保留跨 chunk 的半个多字节字符，避免中文乱码
      const text = decoder.decode(value, { stream: true });
      const parsed = appendSseText(buffer, text);
      buffer = parsed.buffer;
      if (parsed.sawDone) sawDone = true;

      for (const payload of parsed.dataPayloads) {
        try {
          const json = JSON.parse(payload) as {
            choices?: Array<{
              delta?: { content?: string; reasoning_content?: string };
            }>;
          };
          const delta = json.choices?.[0]?.delta;
          if (delta?.content) {
            content += delta.content;
            handlers.onStream?.(delta.content);
          }
          if (delta?.reasoning_content) {
            reasoningContent += delta.reasoning_content;
            handlers.onStreamReasoning?.(delta.reasoning_content);
          }
        } catch {
          // 忽略单条坏 JSON，继续读后续事件
        }
      }
    }
  } catch (error) {
    if (isAbortError(error) || handlers.signal?.aborted) {
      return { content, reasoningContent, sawDone, status: 'aborted' };
    }
    throw error;
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }

  if (handlers.signal?.aborted) {
    return { content, reasoningContent, sawDone, status: 'aborted' };
  }
  if (sawDone) {
    return { content, reasoningContent, sawDone, status: 'completed' };
  }
  // 连接结束但从未见到 [DONE]：当作异常断流
  return { content, reasoningContent, sawDone, status: 'incomplete' };
}

export async function chatCompletion(
  messages: ChatCompletionMessageParam[],
  settings: Settings,
  apiKey: string,
  onStream?: (content: string) => void,
  onStreamReasoning?: (content: string) => void,
  signal?: AbortSignal
): Promise<ChatCompletionResult> {
  const handlers: ChatCompletionHandlers = { onStream, onStreamReasoning, signal };
  const modelName = API_CONFIG.MODELS.chat;
  validateMessages(messages, modelName);

  if (!apiKey || apiKey.length < 30) {
    throw new Error('请先在设置页面配置您的 DeepSeek API Key');
  }

  let response: Response;
  try {
    response = await fetch(CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages.map(({ role, content }) => ({ role, content })),
        temperature: settings.temperature,
        // tools 暂未启用：请求体不带 tools，避免半残函数调用路径
        stream: true,
      }),
      signal,
    });
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) {
      return { content: '', reasoningContent: '', status: 'aborted' };
    }
    throw error;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => null);
    const errorMessage = errorBody?.toLowerCase() || response.statusText.toLowerCase();

    if (
      errorMessage.includes('authentication') ||
      errorMessage.includes('apikey') ||
      errorMessage.includes('api key') ||
      errorMessage.includes('access token') ||
      errorMessage.includes('unauthorized')
    ) {
      throw new Error('API Key 无效，请检查您的 API Key 设置');
    }

    throw new Error(
      `API 请求失败 (${response.status}): ${response.statusText}\n${
        errorBody ? `详细信息: ${errorBody}` : ''
      }`
    );
  }

  if (!response.body) {
    throw new Error('响应体为空');
  }

  const result = await readChatSseStream(response.body, handlers);
  return {
    content: result.content,
    reasoningContent: result.reasoningContent,
    status: result.status,
  };
}

export interface BalanceInfo {
  currency: 'CNY' | 'USD';
  total_balance: string;
  granted_balance: string;
  topped_up_balance: string;
}

export interface BalanceResponse {
  is_available: boolean;
  balance_infos: BalanceInfo[];
}

export async function getBalance(apiKey: string): Promise<BalanceResponse> {
  if (!apiKey) {
    throw new Error('请先设置 API Key');
  }
  const response = await fetch('https://api.deepseek.com/user/balance', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('获取余额失败');
  }

  return response.json();
}
