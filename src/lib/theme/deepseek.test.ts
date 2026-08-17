import { describe, expect, it } from 'vitest';
import { DEEPSEEK_BLUE, INK_CONSOLE, inkConsoleCssVars } from './deepseek';

describe('ink console theme tokens', () => {
  it('exports the locked ink-console palette', () => {
    expect(INK_CONSOLE).toEqual({
      ink: '#08131F',
      panel: '#0E1C2E',
      deck: '#122033',
      line: '#1A3A52',
      signal: '#3BA7FF',
      text: '#DCE8F5',
      dim: '#7A93AB',
    });
  });

  it('aligns DEEPSEEK_BLUE with Signal', () => {
    expect(DEEPSEEK_BLUE).toBe('#3BA7FF');
    expect(DEEPSEEK_BLUE).toBe(INK_CONSOLE.signal);
  });

  it('exposes CSS variables for the same palette', () => {
    expect(inkConsoleCssVars()).toMatchObject({
      '--ink': '#08131F',
      '--panel': '#0E1C2E',
      '--deck': '#122033',
      '--line': '#1A3A52',
      '--signal': '#3BA7FF',
      '--text': '#DCE8F5',
      '--dim': '#7A93AB',
    });
  });
});
