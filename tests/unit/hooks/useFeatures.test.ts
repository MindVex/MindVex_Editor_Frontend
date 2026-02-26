import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

/**
 * useFeatures hook tests
 *
 * The hook fetches feature flags from an API and manages which features
 * have been viewed via localStorage. We mock both the API module and
 * localStorage to keep tests isolated.
 */

// ── Mock the API functions ──────────────────────────────────────────────────
vi.mock('../../../app/lib/api/features', () => ({
    getFeatureFlags: vi.fn(),
    markFeatureViewed: vi.fn().mockResolvedValue(undefined),
}));

import { getFeatureFlags, markFeatureViewed } from '../../../app/lib/api/features';
const { useFeatures } = await import('../../../app/lib/hooks/useFeatures');

const mockFeatures = [
    { id: 'feature-1', title: 'Dark Mode', description: 'New dark mode!' },
    { id: 'feature-2', title: 'AI Chat', description: 'Chat with your code.' },
    { id: 'feature-3', title: 'Git Integration', description: 'Native git support.' },
];

describe('useFeatures', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (getFeatureFlags as any).mockResolvedValue(mockFeatures);
    });

    // ── Initial state ──────────────────────────────────────────────────────────

    it('should initialise with no new features until fetch completes', async () => {
        const { result } = renderHook(() => useFeatures());
        // Before the async fetch resolves
        expect(result.current.hasNewFeatures).toBe(false);
        await waitFor(() => expect(result.current.hasNewFeatures).toBe(true));
    });

    it('should populate unviewedFeatures after fetching', async () => {
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.unviewedFeatures).toHaveLength(3));
    });

    it('should set hasNewFeatures to true when there are unviewed features', async () => {
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.hasNewFeatures).toBe(true));
    });

    // ── Already-viewed features ───────────────────────────────────────────────

    it('should exclude already-viewed features from unviewedFeatures', async () => {
        localStorage.setItem('mindvex_viewed_features', JSON.stringify(['feature-1']));
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.unviewedFeatures).toHaveLength(2));
        expect(result.current.unviewedFeatures.some((f) => f.id === 'feature-1')).toBe(false);
    });

    it('should set hasNewFeatures to false when all features have already been viewed', async () => {
        localStorage.setItem(
            'mindvex_viewed_features',
            JSON.stringify(['feature-1', 'feature-2', 'feature-3']),
        );
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.hasNewFeatures).toBe(false));
    });

    // ── acknowledgeFeature ────────────────────────────────────────────────────

    it('should remove a single feature from unviewedFeatures after acknowledging it', async () => {
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.unviewedFeatures).toHaveLength(3));

        await act(async () => {
            await result.current.acknowledgeFeature('feature-1');
        });

        expect(result.current.unviewedFeatures.some((f) => f.id === 'feature-1')).toBe(false);
        expect(result.current.unviewedFeatures).toHaveLength(2);
    });

    it('should call markFeatureViewed with the correct feature id', async () => {
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.unviewedFeatures).toHaveLength(3));

        await act(async () => {
            await result.current.acknowledgeFeature('feature-2');
        });

        expect(markFeatureViewed).toHaveBeenCalledWith('feature-2');
    });

    it('should persist acknowledged feature to localStorage', async () => {
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.unviewedFeatures).toHaveLength(3));

        await act(async () => {
            await result.current.acknowledgeFeature('feature-3');
        });

        const stored = JSON.parse(localStorage.getItem('mindvex_viewed_features') || '[]');
        expect(stored).toContain('feature-3');
    });

    // ── acknowledgeAllFeatures ────────────────────────────────────────────────

    it('should clear all unviewedFeatures after acknowledgeAllFeatures', async () => {
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.unviewedFeatures).toHaveLength(3));

        await act(async () => {
            await result.current.acknowledgeAllFeatures();
        });

        expect(result.current.unviewedFeatures).toHaveLength(0);
        expect(result.current.hasNewFeatures).toBe(false);
    });

    it('should call markFeatureViewed for every feature when acknowledging all', async () => {
        const { result } = renderHook(() => useFeatures());
        await waitFor(() => expect(result.current.unviewedFeatures).toHaveLength(3));

        await act(async () => {
            await result.current.acknowledgeAllFeatures();
        });

        expect(markFeatureViewed).toHaveBeenCalledTimes(3);
    });

    // ── API error handling ────────────────────────────────────────────────────

    it('should gracefully handle API errors without crashing', async () => {
        (getFeatureFlags as any).mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useFeatures());
        // Should not throw
        await waitFor(() => {
            expect(result.current.hasNewFeatures).toBe(false);
            expect(result.current.unviewedFeatures).toHaveLength(0);
        });
    });
});
