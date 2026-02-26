import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * useSearchFilter hook tests
 *
 * The hook uses React internals (useState, useMemo, useCallback) and the
 * project's own debounce utility. We test the pure filtering logic by
 * controlling the items input directly.
 *
 * NOTE: Because the hook debounces input, we advance fake timers to flush
 * the debounce delay.
 */
vi.useFakeTimers();

// Dynamic import so Vitest can resolve the module at test-run time
const { useSearchFilter } = await import('../../../app/lib/hooks/useSearchFilter');

const makeChatItem = (id: string, description: string, urlId: string = id) => ({
    id,
    urlId,
    title: description,
    description,
    messages: [],
    timestamp: new Date().toISOString(),
});

describe('useSearchFilter', () => {
    const items = [
        makeChatItem('1', 'Fix the login bug'),
        makeChatItem('2', 'Add dark mode support'),
        makeChatItem('3', 'Refactor authentication flow'),
        makeChatItem('4', 'Write unit tests'),
    ];

    beforeEach(() => {
        vi.clearAllTimers();
    });

    // ── Initial state ──────────────────────────────────────────────────────────

    it('should return all items initially (empty query)', () => {
        const { result } = renderHook(() => useSearchFilter({ items }));
        expect(result.current.filteredItems).toHaveLength(items.length);
    });

    it('should have an empty searchQuery initially', () => {
        const { result } = renderHook(() => useSearchFilter({ items }));
        expect(result.current.searchQuery).toBe('');
    });

    it('should expose a handleSearchChange function', () => {
        const { result } = renderHook(() => useSearchFilter({ items }));
        expect(typeof result.current.handleSearchChange).toBe('function');
    });

    // ── Filtering behaviour ────────────────────────────────────────────────────

    it('should filter items that match the description field', () => {
        const { result } = renderHook(() => useSearchFilter({ items }));

        act(() => {
            result.current.handleSearchChange({
                target: { value: 'login' },
            } as React.ChangeEvent<HTMLInputElement>);
            vi.advanceTimersByTime(400); // flush debounce
        });

        expect(result.current.filteredItems).toHaveLength(1);
        expect(result.current.filteredItems[0].id).toBe('1');
    });

    it('should be case-insensitive when filtering', () => {
        const { result } = renderHook(() => useSearchFilter({ items }));

        act(() => {
            result.current.handleSearchChange({
                target: { value: 'DARK MODE' },
            } as React.ChangeEvent<HTMLInputElement>);
            vi.advanceTimersByTime(400);
        });

        expect(result.current.filteredItems).toHaveLength(1);
        expect(result.current.filteredItems[0].id).toBe('2');
    });

    it('should return an empty array when no items match', () => {
        const { result } = renderHook(() => useSearchFilter({ items }));

        act(() => {
            result.current.handleSearchChange({
                target: { value: 'xyz-nonexistent-query' },
            } as React.ChangeEvent<HTMLInputElement>);
            vi.advanceTimersByTime(400);
        });

        expect(result.current.filteredItems).toHaveLength(0);
    });

    it('should return all items when search query is cleared', () => {
        const { result } = renderHook(() => useSearchFilter({ items }));

        act(() => {
            result.current.handleSearchChange({ target: { value: 'login' } } as any);
            vi.advanceTimersByTime(400);
        });

        act(() => {
            result.current.handleSearchChange({ target: { value: '' } } as any);
            vi.advanceTimersByTime(400);
        });

        expect(result.current.filteredItems).toHaveLength(items.length);
    });

    // ── Edge cases ─────────────────────────────────────────────────────────────

    it('should handle empty items array gracefully', () => {
        const { result } = renderHook(() => useSearchFilter({ items: [] }));

        act(() => {
            result.current.handleSearchChange({ target: { value: 'something' } } as any);
            vi.advanceTimersByTime(400);
        });

        expect(result.current.filteredItems).toHaveLength(0);
    });

    it('should support a custom debounce delay', () => {
        const { result } = renderHook(() => useSearchFilter({ items, debounceMs: 100 }));

        act(() => {
            result.current.handleSearchChange({ target: { value: 'login' } } as any);
        });

        // Not flushed yet — all items still returned
        act(() => { vi.advanceTimersByTime(50); });
        // After flush — correct items
        act(() => { vi.advanceTimersByTime(100); });

        expect(result.current.filteredItems).toHaveLength(1);
    });
});
