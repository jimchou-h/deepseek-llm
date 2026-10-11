export const API_CONFIG = {
  BASE_URL: 'https://api.deepseek.com',
  BASE_URL_V0: 'https://api.deepseek.com',
  MODELS: {
    pro: 'deepseek-v4-pro',
    flash: 'deepseek-v4-flash',
  },
} as const;

export type ModelType = keyof typeof API_CONFIG.MODELS; 