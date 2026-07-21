import { describe, expect, it } from 'vitest';
import { DEEPSEEK_BLUE } from './deepseek';

describe('DeepSeek theme token', () => {
  it('uses Ant Design primary blue #1890ff', () => {
    expect(DEEPSEEK_BLUE).toBe('#1890ff');
  });
});
