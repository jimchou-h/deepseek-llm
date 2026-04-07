import { FunctionDefinition } from '@/types/settings';
import { message } from 'antd';
import { processUrlParameters, processRequestBody } from '@/lib/utils/function-utils';

export async function executeFunctionCall(
  functionDef: FunctionDefinition,
  args: Record<string, any>
) {
  try {
    // 处理 URL 参数和请求体
    const url = processUrlParameters(functionDef.url, args);
    const requestBody = processRequestBody(args, functionDef.parameters);

    const response = await fetch(url, {
      method: functionDef.method,
      headers: {
        'Content-Type': 'application/json',
        ...functionDef.headers,
      },
      ...(functionDef.method === 'POST' && {
        body: JSON.stringify(requestBody),
      }),
    }).catch(error => {
      const errorMessage = error.message.toLowerCase();
      const errorText = errorMessage.includes('authentication') || 
          errorMessage.includes('apikey') || 
          errorMessage.includes('api key') || 
          errorMessage.includes('access token') ||
          errorMessage.includes('unauthorized')
        ? `函数 ${functionDef.name} 调用失败：API Key 无效，请检查函数配置中的 API Key 设置`
        : errorMessage.includes('network') || errorMessage.includes('fetch')
        ? `函数 ${functionDef.name} 调用失败：网络请求错误，请检查网络连接和 API 地址`
        : `函数 ${functionDef.name} 调用失败：${error.message}`;
      
      message.error(errorText);
      throw new Error(errorText);
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => null);
      const errorMessage = (errorBody || response.statusText).toLowerCase();
      let errorText: string;
      
      if (errorMessage.includes('authentication') || 
          errorMessage.includes('apikey') || 
          errorMessage.includes('api key') || 
          errorMessage.includes('access token') ||
          errorMessage.includes('unauthorized')) {
        errorText = `函数 ${functionDef.name} 调用失败：API Key 无效，请检查函数配置中的 API Key 设置`;
      } else if (response.status === 404) {
        errorText = `函数 ${functionDef.name} 调用失败：API 地址无效，请检查函数配置中的 URL`;
      } else if (response.status === 429) {
        errorText = `函数 ${functionDef.name} 调用失败：请求频率超限，请稍后重试`;
      } else {
        errorText = `函数 ${functionDef.name} 调用失败 (${response.status}): ${response.statusText}\n` +
          `${errorBody ? `详细信息: ${errorBody}` : ''}`;
      }

      message.error(errorText);
      throw new Error(errorText);
    }

    const data = await response.json().catch(() => {
      const errorText = `函数 ${functionDef.name} 调用失败：返回数据格式错误，请检查 API 响应`;
      message.error(errorText);
      throw new Error(errorText);
    });

    return data;
  } catch (error) {
    console.error('函数执行错误:', error);
    throw error;
  }
} 