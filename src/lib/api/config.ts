export const API_CONFIG = {
  BASE_URL: 'https://api.siliconflow.cn/v1',
  BASE_URL_V0: 'https://api.siliconflow.cn/v1',
  BASE_COZE_URL: 'https://api.coze.cn/v1',
  MODELS: {
    'chat': 'deepseek-ai/DeepSeek-V3.2',
    'coder': 'deepseek-coder',
    'reasoner': 'deepseek-reasoner',
  },
} as const;

export type ModelType = keyof typeof API_CONFIG.MODELS; 