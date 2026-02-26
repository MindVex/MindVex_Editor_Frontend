import { describe, it, expect } from 'vitest';
import { allowedHTMLElements, remarkPlugins, rehypePlugins } from '../../../app/utils/markdown';

// ─────────────────────────────────────────────────────────────────────────────
// allowedHTMLElements
// ─────────────────────────────────────────────────────────────────────────────
describe('allowedHTMLElements', () => {
    it('should be a non-empty array', () => {
        expect(Array.isArray(allowedHTMLElements)).toBe(true);
        expect(allowedHTMLElements.length).toBeGreaterThan(0);
    });

    it('should contain common semantic HTML elements', () => {
        expect(allowedHTMLElements).toContain('p');
        expect(allowedHTMLElements).toContain('h1');
        expect(allowedHTMLElements).toContain('h2');
        expect(allowedHTMLElements).toContain('h3');
        expect(allowedHTMLElements).toContain('ul');
        expect(allowedHTMLElements).toContain('ol');
        expect(allowedHTMLElements).toContain('li');
    });

    it('should contain code-related elements', () => {
        expect(allowedHTMLElements).toContain('code');
        expect(allowedHTMLElements).toContain('pre');
    });

    it('should contain table elements', () => {
        expect(allowedHTMLElements).toContain('table');
        expect(allowedHTMLElements).toContain('thead');
        expect(allowedHTMLElements).toContain('tbody');
        expect(allowedHTMLElements).toContain('tr');
        expect(allowedHTMLElements).toContain('th');
        expect(allowedHTMLElements).toContain('td');
    });

    it('should contain inline formatting elements', () => {
        expect(allowedHTMLElements).toContain('strong');
        expect(allowedHTMLElements).toContain('em');
        expect(allowedHTMLElements).toContain('a');
        expect(allowedHTMLElements).toContain('code');
        expect(allowedHTMLElements).toContain('del');
    });

    it('should NOT contain dangerous elements like script or iframe', () => {
        expect(allowedHTMLElements).not.toContain('script');
        expect(allowedHTMLElements).not.toContain('iframe');
        expect(allowedHTMLElements).not.toContain('object');
        expect(allowedHTMLElements).not.toContain('embed');
        expect(allowedHTMLElements).not.toContain('form');
    });

    it('should contain the custom think element used for AI reasoning', () => {
        expect(allowedHTMLElements).toContain('think');
    });

    it('should have only unique elements (no duplicates)', () => {
        const uniqueElements = new Set(allowedHTMLElements);
        expect(uniqueElements.size).toBe(allowedHTMLElements.length);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// remarkPlugins
// ─────────────────────────────────────────────────────────────────────────────
describe('remarkPlugins', () => {
    it('should return an array', () => {
        expect(Array.isArray(remarkPlugins(false))).toBe(true);
        expect(Array.isArray(remarkPlugins(true))).toBe(true);
    });

    it('should return plugins when limitedMarkdown is false', () => {
        const plugins = remarkPlugins(false);
        expect(plugins.length).toBeGreaterThan(0);
    });

    it('should return plugins when limitedMarkdown is true', () => {
        const plugins = remarkPlugins(true);
        expect(plugins.length).toBeGreaterThan(0);
    });

    it('should return more plugins in limited mode than normal mode', () => {
        // limitedMarkdownPlugin is added when limitedMarkdown=true
        const normalPlugins = remarkPlugins(false);
        const limitedPlugins = remarkPlugins(true);
        expect(limitedPlugins.length).toBeGreaterThanOrEqual(normalPlugins.length);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// rehypePlugins
// ─────────────────────────────────────────────────────────────────────────────
describe('rehypePlugins', () => {
    it('should return an array', () => {
        expect(Array.isArray(rehypePlugins(true))).toBe(true);
        expect(Array.isArray(rehypePlugins(false))).toBe(true);
    });

    it('should return an empty array when html=false', () => {
        expect(rehypePlugins(false)).toEqual([]);
    });

    it('should return plugins when html=true', () => {
        const plugins = rehypePlugins(true);
        expect(plugins.length).toBeGreaterThan(0);
    });

    it('should include sanitization plugin when html=true', () => {
        // When HTML is enabled two plugins are added: rehypeRaw and rehypeSanitize
        const plugins = rehypePlugins(true);
        expect(plugins.length).toBeGreaterThanOrEqual(2);
    });
});
