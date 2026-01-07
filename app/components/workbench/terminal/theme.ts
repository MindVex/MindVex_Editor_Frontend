import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--mindvex-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--mindvex-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--mindvex-elements-terminal-textColor'),
    background: cssVar('--mindvex-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--mindvex-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--mindvex-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--mindvex-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--mindvex-elements-terminal-color-black'),
    red: cssVar('--mindvex-elements-terminal-color-red'),
    green: cssVar('--mindvex-elements-terminal-color-green'),
    yellow: cssVar('--mindvex-elements-terminal-color-yellow'),
    blue: cssVar('--mindvex-elements-terminal-color-blue'),
    magenta: cssVar('--mindvex-elements-terminal-color-magenta'),
    cyan: cssVar('--mindvex-elements-terminal-color-cyan'),
    white: cssVar('--mindvex-elements-terminal-color-white'),
    brightBlack: cssVar('--mindvex-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--mindvex-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--mindvex-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--mindvex-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--mindvex-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--mindvex-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--mindvex-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--mindvex-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
