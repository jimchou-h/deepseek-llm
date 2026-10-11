import type { ModelType } from '@/lib/api/config';

export function resolveSessionModel(
  sessionModel: ModelType | undefined,
  globalModel: ModelType
): ModelType {
  return sessionModel ?? globalModel;
}
