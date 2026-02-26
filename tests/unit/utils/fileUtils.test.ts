import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    generateId,
    shouldIncludeFile,
    IGNORE_PATTERNS,
    MAX_FILES,
    filesToArtifacts,
} from '../../../app/utils/fileUtils';

// ─────────────────────────────────────────────────────────────────────────────
// generateId
// ─────────────────────────────────────────────────────────────────────────────
describe('generateId', () => {
    it('should return a non-empty string', () => {
        const id = generateId();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
    });

    it('should return a unique ID every time', () => {
        const ids = new Set(Array.from({ length: 100 }, () => generateId()));
        expect(ids.size).toBe(100);
    });

    it('should only contain alphanumeric characters', () => {
        const id = generateId();
        expect(id).toMatch(/^[a-z0-9]+$/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// IGNORE_PATTERNS & MAX_FILES constants
// ─────────────────────────────────────────────────────────────────────────────
describe('IGNORE_PATTERNS', () => {
    it('should be an array', () => {
        expect(Array.isArray(IGNORE_PATTERNS)).toBe(true);
    });

    it('should include common patterns like node_modules and .git', () => {
        expect(IGNORE_PATTERNS).toContain('node_modules/**');
        expect(IGNORE_PATTERNS).toContain('.git/**');
    });

    it('should include build output patterns', () => {
        expect(IGNORE_PATTERNS).toContain('dist/**');
        expect(IGNORE_PATTERNS).toContain('build/**');
    });

    it('should include log file patterns', () => {
        expect(IGNORE_PATTERNS.some((p) => p.includes('.log'))).toBe(true);
    });
});

describe('MAX_FILES constant', () => {
    it('should be a positive number', () => {
        expect(typeof MAX_FILES).toBe('number');
        expect(MAX_FILES).toBeGreaterThan(0);
    });

    it('should be 1000', () => {
        expect(MAX_FILES).toBe(1000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// shouldIncludeFile
// ─────────────────────────────────────────────────────────────────────────────
describe('shouldIncludeFile', () => {
    it('should include regular source files', () => {
        expect(shouldIncludeFile('src/index.ts')).toBe(true);
        expect(shouldIncludeFile('app/main.tsx')).toBe(true);
        expect(shouldIncludeFile('README.md')).toBe(true);
    });

    it('should exclude node_modules', () => {
        expect(shouldIncludeFile('node_modules/react/index.js')).toBe(false);
    });

    it('should exclude .git files', () => {
        expect(shouldIncludeFile('.git/HEAD')).toBe(false);
        expect(shouldIncludeFile('.git/config')).toBe(false);
    });

    it('should exclude dist and build directories', () => {
        expect(shouldIncludeFile('dist/bundle.js')).toBe(false);
        expect(shouldIncludeFile('build/index.html')).toBe(false);
    });

    it('should exclude .log files', () => {
        expect(shouldIncludeFile('npm-debug.log')).toBe(false);
        expect(shouldIncludeFile('yarn-debug.log')).toBe(false);
    });

    it('should exclude .DS_Store', () => {
        expect(shouldIncludeFile('.DS_Store')).toBe(false);
    });

    it('should exclude coverage directory', () => {
        expect(shouldIncludeFile('coverage/lcov.info')).toBe(false);
    });

    it('should include dotfiles that are not in the ignore list', () => {
        expect(shouldIncludeFile('.env')).toBe(true);
        expect(shouldIncludeFile('.prettierrc')).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// filesToArtifacts
// ─────────────────────────────────────────────────────────────────────────────
describe('filesToArtifacts', () => {
    it('should produce a string containing the artifact wrapper', () => {
        const result = filesToArtifacts({ 'src/index.ts': { content: 'console.log(1);' } }, 'test-id');
        expect(result).toContain('mindvexArtifact');
        expect(result).toContain('test-id');
    });

    it('should include file paths in the output', () => {
        const result = filesToArtifacts(
            {
                'src/index.ts': { content: 'const x = 1;' },
                'src/utils.ts': { content: 'export const pi = 3.14;' },
            },
            'my-id',
        );
        expect(result).toContain('src/index.ts');
        expect(result).toContain('src/utils.ts');
    });

    it('should include file content in the output', () => {
        const content = 'export const hello = "world";';
        const result = filesToArtifacts({ 'src/hello.ts': { content } }, 'abc');
        expect(result).toContain(content);
    });

    it('should include the correct artifact id', () => {
        const result = filesToArtifacts({}, 'unique-artifact-99');
        expect(result).toContain('unique-artifact-99');
    });

    it('should handle an empty files object', () => {
        const result = filesToArtifacts({}, 'empty-id');
        expect(typeof result).toBe('string');
        expect(result).toContain('mindvexArtifact');
    });

    it('should include mindvexAction tags for each file', () => {
        const result = filesToArtifacts({ 'a.ts': { content: '' } }, 'x');
        expect(result).toContain('mindvexAction');
        expect(result).toContain('type="file"');
    });
});
