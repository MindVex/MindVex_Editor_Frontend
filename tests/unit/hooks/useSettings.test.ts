import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * useSettings hook tests
 *
 * The hook wraps multiple Nanostores and localStorage. We mock:
 *  - @nanostores/react's useStore
 *  - The stores/settings module (all stores + action functions)
 *  - js-cookie
 *  - app/lib/persistence (getLocalStorage / setLocalStorage)
 *
 * This isolates the hook logic from external dependencies.
 */

vi.mock('@nanostores/react', () => ({
    useStore: vi.fn((store) => store.mockValue ?? store.get?.() ?? false),
}));

vi.mock('../../../app/lib/stores/settings', () => ({
    isDebugMode: { get: () => false, set: vi.fn(), mockValue: false },
    isEventLogsEnabled: { get: () => true, mockValue: true },
    promptStore: { get: () => 'default', mockValue: 'default' },
    providersStore: { get: () => ({}), mockValue: {} },
    latestBranchStore: { get: () => false, mockValue: false },
    autoSelectStarterTemplate: { get: () => false, mockValue: false },
    enableContextOptimizationStore: { get: () => false, mockValue: false },
    tabConfigurationStore: { get: () => ({ user: [], developer: [] }), mockValue: { user: [], developer: [] } },
    shortcutsStore: { get: () => ({}) },
    resetTabConfiguration: vi.fn(),
    updateProviderSettings: vi.fn(),
    updateLatestBranch: vi.fn(),
    updateAutoSelectTemplate: vi.fn(),
    updateContextOptimization: vi.fn(),
    updateEventLogs: vi.fn(),
    updatePromptId: vi.fn(),
}));

vi.mock('js-cookie', () => ({
    default: { set: vi.fn(), get: vi.fn() },
}));

vi.mock('../../../app/lib/stores/logs', () => ({
    logStore: { logSystem: vi.fn(), logs: { subscribe: vi.fn(() => () => { }) } },
}));

vi.mock('../../../app/lib/persistence', () => ({
    getLocalStorage: vi.fn(() => null),
    setLocalStorage: vi.fn(),
}));

import { getLocalStorage, setLocalStorage } from '../../../app/lib/persistence';
const { useSettings } = await import('../../../app/lib/hooks/useSettings');

describe('useSettings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getLocalStorage as any).mockReturnValue(null);
    });

    // ── Initial state ──────────────────────────────────────────────────────────

    it('should return a settings object on mount', () => {
        const { result } = renderHook(() => useSettings());
        expect(result.current.settings).toBeDefined();
    });

    it('should default theme to "system"', () => {
        const { result } = renderHook(() => useSettings());
        expect(result.current.settings.theme).toBe('system');
    });

    it('should default language to "en"', () => {
        const { result } = renderHook(() => useSettings());
        expect(result.current.settings.language).toBe('en');
    });

    it('should default notifications to true', () => {
        const { result } = renderHook(() => useSettings());
        expect(result.current.settings.notifications).toBe(true);
    });

    // ── Theme ──────────────────────────────────────────────────────────────────

    it('should change theme via setTheme and persist to localStorage', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.setTheme('dark');
        });

        expect(result.current.settings.theme).toBe('dark');
        expect(setLocalStorage).toHaveBeenCalledWith(
            'settings',
            expect.objectContaining({ theme: 'dark' }),
        );
    });

    it('should support all valid theme values', () => {
        const { result } = renderHook(() => useSettings());
        const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

        themes.forEach((theme) => {
            act(() => { result.current.setTheme(theme); });
            expect(result.current.settings.theme).toBe(theme);
        });
    });

    // ── Language ───────────────────────────────────────────────────────────────

    it('should update language and persist it', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.setLanguage('fr');
        });

        expect(result.current.settings.language).toBe('fr');
        expect(setLocalStorage).toHaveBeenCalledWith(
            'settings',
            expect.objectContaining({ language: 'fr' }),
        );
    });

    // ── Notifications ──────────────────────────────────────────────────────────

    it('should toggle notifications off', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.setNotifications(false);
        });

        expect(result.current.settings.notifications).toBe(false);
    });

    it('should toggle notifications on', () => {
        const { result } = renderHook(() => useSettings());

        act(() => { result.current.setNotifications(false); });
        act(() => { result.current.setNotifications(true); });

        expect(result.current.settings.notifications).toBe(true);
    });

    // ── Timezone ───────────────────────────────────────────────────────────────

    it('should update timezone', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.setTimezone('America/New_York');
        });

        expect(result.current.settings.timezone).toBe('America/New_York');
    });

    // ── pre-stored settings ────────────────────────────────────────────────────

    it('should restore settings from localStorage on mount', () => {
        (getLocalStorage as any).mockReturnValue({ theme: 'light', language: 'de', notifications: false });
        const { result } = renderHook(() => useSettings());

        expect(result.current.settings.theme).toBe('light');
        expect(result.current.settings.language).toBe('de');
        expect(result.current.settings.notifications).toBe(false);
    });

    // ── Exposed controls ───────────────────────────────────────────────────────

    it('should expose setter functions for all settings categories', () => {
        const { result } = renderHook(() => useSettings());
        expect(typeof result.current.setTheme).toBe('function');
        expect(typeof result.current.setLanguage).toBe('function');
        expect(typeof result.current.setNotifications).toBe('function');
        expect(typeof result.current.setTimezone).toBe('function');
        expect(typeof result.current.enableDebugMode).toBe('function');
        expect(typeof result.current.setEventLogs).toBe('function');
        expect(typeof result.current.setPromptId).toBe('function');
        expect(typeof result.current.enableLatestBranch).toBe('function');
        expect(typeof result.current.setAutoSelectTemplate).toBe('function');
        expect(typeof result.current.enableContextOptimization).toBe('function');
        expect(typeof result.current.updateProviderSettings).toBe('function');
        expect(typeof result.current.resetTabConfiguration).toBe('function');
    });
});
