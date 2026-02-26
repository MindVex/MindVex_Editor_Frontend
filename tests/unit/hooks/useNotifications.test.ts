import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

/**
 * useNotifications hook tests
 *
 * The hook calls getNotifications on mount and on each markAsRead/markAllAsRead.
 * We mock the API layer and verify the hook's observable state + function calls.
 *
 * Key insight: markNotificationRead does NOT automatically update the
 * unreadNotifications list — the hook re-calls checkNotifications() which
 * re-fetches from getNotifications(). Since the mock always returns the same
 * set, the list length doesn't change after marking; instead we verify:
 *   1. markNotificationRead is called with the right id
 *   2. getNotifications is called again (refetch triggered)
 */

vi.mock('../../../app/lib/api/notifications', () => ({
    getNotifications: vi.fn(),
    markNotificationRead: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../app/lib/stores/logs', () => ({
    logStore: {
        isRead: vi.fn(() => false),
        logs: {
            subscribe: (cb: (v: any) => void) => { cb([]); return () => { }; },
        },
    },
}));

const STABLE_LOGS: any[] = [];
vi.mock('@nanostores/react', () => ({
    useStore: vi.fn(() => STABLE_LOGS),
}));

import { getNotifications, markNotificationRead } from '../../../app/lib/api/notifications';
import { logStore } from '../../../app/lib/stores/logs';
const { useNotifications } = await import('../../../app/lib/hooks/useNotifications');

const n = (id: string) => ({ id, title: `Notification ${id}` });

describe('useNotifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (logStore.isRead as any).mockReturnValue(false);
        (getNotifications as any).mockResolvedValue([n('n1'), n('n2'), n('n3')]);
    });

    // ── Initial state ──────────────────────────────────────────────────────────

    it('should initially have no unread notifications before fetch resolves', () => {
        // Stub a never-resolving promise to test the initial state
        (getNotifications as any).mockReturnValue(new Promise(() => { }));
        const { result } = renderHook(() => useNotifications());
        expect(result.current.hasUnreadNotifications).toBe(false);
        expect(result.current.unreadNotifications).toHaveLength(0);
    });

    it('should populate unreadNotifications after fetching', async () => {
        const { result } = renderHook(() => useNotifications());
        await waitFor(() => expect(result.current.unreadNotifications).toHaveLength(3));
    });

    it('should set hasUnreadNotifications=true when there are unread items', async () => {
        const { result } = renderHook(() => useNotifications());
        await waitFor(() => expect(result.current.hasUnreadNotifications).toBe(true));
    });

    // ── Already-read notifications ─────────────────────────────────────────────

    it('should exclude already-read notifications from unreadNotifications', async () => {
        (logStore.isRead as any).mockImplementation((id: string) => id === 'n1');
        const { result } = renderHook(() => useNotifications());
        await waitFor(() => expect(result.current.unreadNotifications).toHaveLength(2));
        expect(result.current.unreadNotifications.some((x: any) => x.id === 'n1')).toBe(false);
    });

    it('should report hasUnreadNotifications=false when all notifications are read', async () => {
        (logStore.isRead as any).mockReturnValue(true);
        const { result } = renderHook(() => useNotifications());
        await waitFor(() => expect(result.current.hasUnreadNotifications).toBe(false));
    });

    // ── markAsRead ─────────────────────────────────────────────────────────────

    it('should call markNotificationRead with the correct id', async () => {
        const { result } = renderHook(() => useNotifications());
        // Wait for initial fetch
        await waitFor(() => expect(result.current.unreadNotifications).toHaveLength(3));

        await act(async () => {
            await result.current.markAsRead('n1');
        });

        expect(markNotificationRead).toHaveBeenCalledWith('n1');
    });

    it('should trigger a refetch after markAsRead (getNotifications called more than once)', async () => {
        const { result } = renderHook(() => useNotifications());
        await waitFor(() => expect(result.current.unreadNotifications).toHaveLength(3));

        const callsBefore = (getNotifications as any).mock.calls.length;
        await act(async () => {
            await result.current.markAsRead('n1');
        });

        expect((getNotifications as any).mock.calls.length).toBeGreaterThan(callsBefore);
    });

    // ── markAllAsRead ──────────────────────────────────────────────────────────

    it('should call markNotificationRead once per notification when marking all as read', async () => {
        const { result } = renderHook(() => useNotifications());
        await waitFor(() => expect(result.current.unreadNotifications).toHaveLength(3));

        await act(async () => {
            await result.current.markAllAsRead();
        });

        // markNotificationRead should be called for each of the 3 notifications
        expect(markNotificationRead).toHaveBeenCalledTimes(3);
    });

    // ── Error handling ─────────────────────────────────────────────────────────

    it('should not crash when getNotifications throws', async () => {
        (getNotifications as any).mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useNotifications());
        // After error, state should stay at initial (empty/false)
        await waitFor(() => expect(result.current.hasUnreadNotifications).toBe(false));
        expect(result.current.unreadNotifications).toHaveLength(0);
    });

    // ── API surface ────────────────────────────────────────────────────────────

    it('should expose markAsRead and markAllAsRead functions', () => {
        const { result } = renderHook(() => useNotifications());
        expect(typeof result.current.markAsRead).toBe('function');
        expect(typeof result.current.markAllAsRead).toBe('function');
    });
});
