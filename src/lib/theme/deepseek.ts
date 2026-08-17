export const INK_CONSOLE = {
  ink: '#08131F',
  panel: '#0E1C2E',
  deck: '#122033',
  line: '#1A3A52',
  signal: '#3BA7FF',
  text: '#DCE8F5',
  dim: '#7A93AB',
} as const;

export const DEEPSEEK_BLUE = INK_CONSOLE.signal;

export function inkConsoleCssVars(): Record<string, string> {
  return {
    '--ink': INK_CONSOLE.ink,
    '--panel': INK_CONSOLE.panel,
    '--deck': INK_CONSOLE.deck,
    '--line': INK_CONSOLE.line,
    '--signal': INK_CONSOLE.signal,
    '--text': INK_CONSOLE.text,
    '--dim': INK_CONSOLE.dim,
  };
}
