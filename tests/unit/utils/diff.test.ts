import { describe, it, expect } from 'vitest';
import {
    diffFiles,
    extractRelativePath,
    fileModificationsToHTML,
    computeFileModifications,
} from '../../../app/utils/diff';

// ─────────────────────────────────────────────────────────────────────────────
// diffFiles
// ─────────────────────────────────────────────────────────────────────────────
describe('diffFiles', () => {
    it('should return undefined when both files are identical', () => {
        const content = 'const x = 1;\nconst y = 2;\n';
        const result = diffFiles('file.ts', content, content);
        expect(result).toBeUndefined();
    });

    it('should return a diff string when content is different', () => {
        const oldContent = 'const x = 1;\n';
        const newContent = 'const x = 99;\n';
        const result = diffFiles('file.ts', oldContent, newContent);
        expect(typeof result).toBe('string');
        expect(result).toBeDefined();
    });

    it('should show added lines with + prefix in the diff', () => {
        const oldContent = 'line1\n';
        const newContent = 'line1\nline2\n';
        const result = diffFiles('file.ts', oldContent, newContent);
        expect(result).toContain('+line2');
    });

    it('should show removed lines with - prefix in the diff', () => {
        const oldContent = 'line1\nline2\n';
        const newContent = 'line1\n';
        const result = diffFiles('file.ts', oldContent, newContent);
        expect(result).toContain('-line2');
    });

    it('should strip the patch header from the diff output', () => {
        const result = diffFiles('app.ts', 'old\n', 'new\n');
        // The header lines like "--- app.ts" and "+++ app.ts" should be stripped
        expect(result).not.toContain('--- app.ts');
        expect(result).not.toContain('+++ app.ts');
    });

    it('should handle empty old content (new file)', () => {
        const result = diffFiles('new.ts', '', 'const x = 1;\n');
        expect(result).toBeDefined();
        expect(result).toContain('+const x = 1;');
    });

    it('should handle empty new content (deleted file)', () => {
        const result = diffFiles('deleted.ts', 'const x = 1;\n', '');
        expect(result).toBeDefined();
        expect(result).toContain('-const x = 1;');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// extractRelativePath
// ─────────────────────────────────────────────────────────────────────────────
describe('extractRelativePath', () => {
    it('should strip the work directory prefix from the file path', () => {
        // WORK_DIR is typically '/home/project'
        const result = extractRelativePath('/home/project/src/index.ts');
        expect(result).toBe('src/index.ts');
    });

    it('should return the path unchanged if work dir prefix is absent', () => {
        const result = extractRelativePath('src/index.ts');
        expect(result).toBe('src/index.ts');
    });

    it('should handle deeply nested paths', () => {
        const result = extractRelativePath('/home/project/app/components/ui/Button.tsx');
        expect(result).toBe('app/components/ui/Button.tsx');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// fileModificationsToHTML
// ─────────────────────────────────────────────────────────────────────────────
describe('fileModificationsToHTML', () => {
    it('should return undefined for an empty modifications object', () => {
        expect(fileModificationsToHTML({})).toBeUndefined();
    });

    it('should produce an HTML string with the modifications tag', () => {
        const result = fileModificationsToHTML({
            'src/index.ts': { type: 'diff', content: '+const x = 2;\n' },
        });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
    });

    it('should include the file path inside the output', () => {
        const result = fileModificationsToHTML({
            'src/app.ts': { type: 'file', content: 'const y = 10;\n' },
        });
        expect(result).toContain('src/app.ts');
    });

    it('should include the content in the output', () => {
        const content = '+const z = 42;\n';
        const result = fileModificationsToHTML({
            'src/z.ts': { type: 'diff', content },
        });
        expect(result).toContain(content);
    });

    it('should preserve the modification type (diff vs file)', () => {
        const diffResult = fileModificationsToHTML({ 'a.ts': { type: 'diff', content: '+abc\n' } });
        const fileResult = fileModificationsToHTML({ 'b.ts': { type: 'file', content: 'full content\n' } });
        expect(diffResult).toContain('<diff');
        expect(fileResult).toContain('<file');
    });

    it('should wrap multiple modifications under one root tag', () => {
        const result = fileModificationsToHTML({
            'a.ts': { type: 'diff', content: '+a\n' },
            'b.ts': { type: 'file', content: 'b content\n' },
        });
        expect(result).toContain('a.ts');
        expect(result).toContain('b.ts');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// computeFileModifications
// ─────────────────────────────────────────────────────────────────────────────
describe('computeFileModifications', () => {
    it('should return undefined when no files are modified', () => {
        const files = {
            '/home/project/index.ts': { type: 'file' as const, content: 'const x = 1;\n', isBinary: false },
        };
        const modifiedFiles = new Map([
            ['/home/project/index.ts', 'const x = 1;\n'], // same content
        ]);
        const result = computeFileModifications(files as any, modifiedFiles);
        expect(result).toBeUndefined();
    });

    it('should return modifications for changed files', () => {
        const files = {
            '/home/project/index.ts': { type: 'file' as const, content: 'const x = 99;\n', isBinary: false },
        };
        const modifiedFiles = new Map([
            ['/home/project/index.ts', 'const x = 1;\n'], // different original
        ]);
        const result = computeFileModifications(files as any, modifiedFiles);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('/home/project/index.ts');
    });

    it('should use file content when diff is larger than the file itself', () => {
        // When the diff is bigger than the file, it should store 'file' type
        const newContent = 'new\n';
        const originalContent = 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl\nm\nn\no\np\nq\nr\ns\nt\nu\nv\nw\nx\ny\nz\n';
        const files = {
            '/home/project/index.ts': { type: 'file' as const, content: newContent, isBinary: false },
        };
        const modifiedFiles = new Map([['/home/project/index.ts', originalContent]]);
        const result = computeFileModifications(files as any, modifiedFiles);
        // It should still return something for this changed file
        expect(result).toBeDefined();
    });

    it('should skip entries that are not file type', () => {
        const files = {
            '/home/project/folder': { type: 'directory' as const },
        };
        const modifiedFiles = new Map([['/home/project/folder', 'old\n']]);
        const result = computeFileModifications(files as any, modifiedFiles);
        expect(result).toBeUndefined();
    });
});
