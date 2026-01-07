import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const collectionName = 'mindvex';

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>,
);

const BASE_COLORS = {
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  accent: {
    50: '#FFFAEB',
    100: '#FEEFC7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#792E0D',
    950: '#552200',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },
  orange: {
    50: '#FFFAEB',
    100: '#FEEFC7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#792E0D',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
};

const COLOR_PRIMITIVES = {
  ...BASE_COLORS,
  alpha: {
    white: generateAlphaPalette(BASE_COLORS.white),
    gray: generateAlphaPalette(BASE_COLORS.gray[900]),
    red: generateAlphaPalette(BASE_COLORS.red[500]),
    accent: generateAlphaPalette(BASE_COLORS.accent[500]),
    orange: generateAlphaPalette(BASE_COLORS.orange[500]),
    black: generateAlphaPalette(BASE_COLORS.gray[950]),
  },
};

export default defineConfig({
  safelist: [...Object.keys(customIconCollection[collectionName] || {}).map((x) => `i-mindvex:${x}`)],
  shortcuts: {
    'mindvex-ease-cubic-bezier': 'ease-[cubic-bezier(0.4,0,0.2,1)]',
    'transition-theme': 'transition-[background-color,border-color,color] duration-150 mindvex-ease-cubic-bezier',
    kdb: 'bg-mindvex-elements-code-background text-mindvex-elements-code-text py-1 px-1.5 rounded-md',
    'max-w-chat': 'max-w-[var(--chat-max-width)]',
  },
  rules: [
    /**
     * This shorthand doesn't exist in Tailwind and we overwrite it to avoid
     * any conflicts with minified CSS classes.
     */
    ['b', {}],
  ],
  theme: {
    colors: {
      ...COLOR_PRIMITIVES,
      mindvex: {
        elements: {
          borderColor: 'var(--mindvex-elements-borderColor)',
          borderColorActive: 'var(--mindvex-elements-borderColorActive)',
          background: {
            depth: {
              1: 'var(--mindvex-elements-bg-depth-1)',
              2: 'var(--mindvex-elements-bg-depth-2)',
              3: 'var(--mindvex-elements-bg-depth-3)',
              4: 'var(--mindvex-elements-bg-depth-4)',
            },
          },
          textPrimary: 'var(--mindvex-elements-textPrimary)',
          textSecondary: 'var(--mindvex-elements-textSecondary)',
          textTertiary: 'var(--mindvex-elements-textTertiary)',
          code: {
            background: 'var(--mindvex-elements-code-background)',
            text: 'var(--mindvex-elements-code-text)',
          },
          button: {
            primary: {
              background: 'var(--mindvex-elements-button-primary-background)',
              backgroundHover: 'var(--mindvex-elements-button-primary-backgroundHover)',
              text: 'var(--mindvex-elements-button-primary-text)',
            },
            secondary: {
              background: 'var(--mindvex-elements-button-secondary-background)',
              backgroundHover: 'var(--mindvex-elements-button-secondary-backgroundHover)',
              text: 'var(--mindvex-elements-button-secondary-text)',
            },
            danger: {
              background: 'var(--mindvex-elements-button-danger-background)',
              backgroundHover: 'var(--mindvex-elements-button-danger-backgroundHover)',
              text: 'var(--mindvex-elements-button-danger-text)',
            },
          },
          item: {
            contentDefault: 'var(--mindvex-elements-item-contentDefault)',
            contentActive: 'var(--mindvex-elements-item-contentActive)',
            contentAccent: 'var(--mindvex-elements-item-contentAccent)',
            contentDanger: 'var(--mindvex-elements-item-contentDanger)',
            backgroundDefault: 'var(--mindvex-elements-item-backgroundDefault)',
            backgroundActive: 'var(--mindvex-elements-item-backgroundActive)',
            backgroundAccent: 'var(--mindvex-elements-item-backgroundAccent)',
            backgroundDanger: 'var(--mindvex-elements-item-backgroundDanger)',
          },
          actions: {
            background: 'var(--mindvex-elements-actions-background)',
            code: {
              background: 'var(--mindvex-elements-actions-code-background)',
            },
          },
          artifacts: {
            background: 'var(--mindvex-elements-artifacts-background)',
            backgroundHover: 'var(--mindvex-elements-artifacts-backgroundHover)',
            borderColor: 'var(--mindvex-elements-artifacts-borderColor)',
            inlineCode: {
              background: 'var(--mindvex-elements-artifacts-inlineCode-background)',
              text: 'var(--mindvex-elements-artifacts-inlineCode-text)',
            },
          },
          messages: {
            background: 'var(--mindvex-elements-messages-background)',
            linkColor: 'var(--mindvex-elements-messages-linkColor)',
            code: {
              background: 'var(--mindvex-elements-messages-code-background)',
            },
            inlineCode: {
              background: 'var(--mindvex-elements-messages-inlineCode-background)',
              text: 'var(--mindvex-elements-messages-inlineCode-text)',
            },
          },
          icon: {
            success: 'var(--mindvex-elements-icon-success)',
            error: 'var(--mindvex-elements-icon-error)',
            primary: 'var(--mindvex-elements-icon-primary)',
            secondary: 'var(--mindvex-elements-icon-secondary)',
            tertiary: 'var(--mindvex-elements-icon-tertiary)',
          },
          preview: {
            addressBar: {
              background: 'var(--mindvex-elements-preview-addressBar-background)',
              backgroundHover: 'var(--mindvex-elements-preview-addressBar-backgroundHover)',
              backgroundActive: 'var(--mindvex-elements-preview-addressBar-backgroundActive)',
              text: 'var(--mindvex-elements-preview-addressBar-text)',
              textActive: 'var(--mindvex-elements-preview-addressBar-textActive)',
            },
          },
          terminals: {
            background: 'var(--mindvex-elements-terminals-background)',
            buttonBackground: 'var(--mindvex-elements-terminals-buttonBackground)',
          },
          dividerColor: 'var(--mindvex-elements-dividerColor)',
          loader: {
            background: 'var(--mindvex-elements-loader-background)',
            progress: 'var(--mindvex-elements-loader-progress)',
          },
          prompt: {
            background: 'var(--mindvex-elements-prompt-background)',
          },
          sidebar: {
            dropdownShadow: 'var(--mindvex-elements-sidebar-dropdownShadow)',
            buttonBackgroundDefault: 'var(--mindvex-elements-sidebar-buttonBackgroundDefault)',
            buttonBackgroundHover: 'var(--mindvex-elements-sidebar-buttonBackgroundHover)',
            buttonText: 'var(--mindvex-elements-sidebar-buttonText)',
          },
          cta: {
            background: 'var(--mindvex-elements-cta-background)',
            text: 'var(--mindvex-elements-cta-text)',
          },
        },
      },
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        light: '[data-theme="light"]',
        dark: '[data-theme="dark"]',
      },
    }),
    presetIcons({
      warn: true,
      collections: {
        ...customIconCollection,
      },
      unit: 'em',
    }),
  ],
});

/**
 * Generates an alpha palette for a given hex color.
 *
 * @param hex - The hex color code (without alpha) to generate the palette from.
 * @returns An object where keys are opacity percentages and values are hex colors with alpha.
 *
 * Example:
 *
 * ```
 * {
 *   '1': '#FFFFFF03',
 *   '2': '#FFFFFF05',
 *   '3': '#FFFFFF08',
 * }
 * ```
 */
function generateAlphaPalette(hex: string) {
  return [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].reduce(
    (acc, opacity) => {
      const alpha = Math.round((opacity / 100) * 255)
        .toString(16)
        .padStart(2, '0');

      acc[opacity] = `${hex}${alpha}`;

      return acc;
    },
    {} as Record<number, string>,
  );
}
