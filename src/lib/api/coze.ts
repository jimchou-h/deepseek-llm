import { API_CONFIG } from './config';

interface CozeWorkflowRunResponse {
  code: number;
  msg: string;
  data: {
    biz_code: number;
    biz_msg: string;
    biz_data: {
      id: string;
      content: string;
      status: string;
      error_code: null | string;
      inserted_at: number;
      updated_at: number;
    };
  };
}

interface CozeWorkflowStreamRunResponse {
  code: number;
  msg: string;
  data: {
    biz_code: number;
    biz_msg: string;
    biz_data: {
      id: string;
      content: string;
      status: string;
      error_code: null | string;
      inserted_at: number;
      updated_at: number;
    };
  };
}

export class CozeApiError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = 'CozeApiError';
  }
}

/**
 * 执行 Coze 工作流（非流式）
 * @param workflow_id 工作流ID
 * @param input 输入参数
 * @param apiKey API密钥
 */
export async function workflowRun(
  workflow_id: string,
  input: Record<string, any>,
  apiKey: string
): Promise<CozeWorkflowRunResponse> {
  const response = await fetch(`${API_CONFIG.BASE_COZE_URL}/workflow/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      workflow_id,
      input,
    }),
  });

  if (!response.ok) {
    throw new CozeApiError(`工作流执行失败: ${response.statusText}`, response.status);
  }

  const result = await response.json();
  if (result.code !== 0) {
    throw new CozeApiError(result.msg || '工作流执行失败', result.code);
  }

  return result;
}

/**
 * 执行 Coze 工作流（流式响应）
 * @param workflow_id 工作流ID
 * @param input 输入参数
 * @param apiKey API密钥
 * @param onStream 流式响应回调函数
 */
export async function workflowStreamRun(
  workflow_id: string,
  input: Record<string, any>,
  apiKey: string,
  onStream?: (content: string) => void
): Promise<void> {
  const response = await fetch(`${API_CONFIG.BASE_COZE_URL}/workflow/stream_run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      workflow_id,
      input,
    }),
  });

  if (!response.ok) {
    throw new CozeApiError(`工作流执行失败: ${response.statusText}`, response.status);
  }

  if (!response.body) {
    throw new CozeApiError('响应体为空');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim() || line.startsWith(':')) continue;

        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices?.[0]?.delta?.content) {
              const content = parsed.choices[0].delta.content;
              onStream?.(content);
            }
          } catch (e) {
            console.error('解析响应数据失败:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 获取工作流执行结果
 * @param workflow_run_id 工作流运行ID
 * @param apiKey API密钥
 */
export async function getWorkflowRunResult(
  workflow_run_id: string,
  apiKey: string
): Promise<CozeWorkflowRunResponse> {
  const response = await fetch(`${API_CONFIG.BASE_COZE_URL}/workflow/run_result/${workflow_run_id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new CozeApiError(`获取工作流结果失败: ${response.statusText}`, response.status);
  }

  const result = await response.json();
  if (result.code !== 0) {
    throw new CozeApiError(result.msg || '获取工作流结果失败', result.code);
  }

  return result;
}
