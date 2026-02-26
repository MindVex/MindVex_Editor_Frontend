import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

/**
 * useShortcuts hook tests
 *
 * The hook registers a global keydown handler that dispatches shortcut
 * events when the correct key combination is pressed. We mock:
 *  - @nanostores/react's useStore to return a controlled shortcuts config
 *  - ~/utils/os (isMac) so we can test non-Mac (ctrl) paths
 *
 * Real Shortcuts keys: toggleTheme | toggleTerminal
 */

vi.mock('@nanostores/react', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../../app/utils/os', () => ({
    isMac: false,
}));

vi.mock('../../../app/lib/stores/settings', () => ({
    shortcutsStore: {},
}));

import { useStore } from '@nanostores/react';
const { useShortcuts, shortcutEventEmitter } = await import('../../../app/lib/hooks/useShortcuts');

// ── Helpers ────────────────────────────────────────────────────────────────────
const makeShortcuts = (themeAction: () => void, terminalAction: () => void) => ({
    toggleTheme: {
        key: 's',
        ctrlOrMetaKey: true,
        isPreventDefault: true,
        action: themeAction,
    },
    toggleTerminal: {
        key: '`',
        ctrlOrMetaKey: true,
        isPreventDefault: true,
        action: terminalAction,
    },
});

describe('useShortcuts', () => {
    let mockThemeAction: ReturnType<typeof vi.fn>;
    let mockTerminalAction: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockThemeAction = vi.fn();
        mockTerminalAction = vi.fn();
        (useStore as any).mockReturnValue(makeShortcuts(mockThemeAction, mockTerminalAction));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // ── Event listener registration ────────────────────────────────────────────

    it('should add a keydown event listener on mount', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        renderHook(() => useShortcuts());
        expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        addSpy.mockRestore();
    });

    it('should remove the keydown listener on unmount', () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const { unmount } = renderHook(() => useShortcuts());
        unmount();
        expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        removeSpy.mockRestore();
    });

    // ── Shortcut triggering ────────────────────────────────────────────────────

    it('should invoke the toggleTheme action when Ctrl+S is pressed', () => {
        renderHook(() => useShortcuts());
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));
        expect(mockThemeAction).toHaveBeenCalledTimes(1);
    });

    it('should NOT trigger any action when only the key without modifier is pressed', () => {
        renderHook(() => useShortcuts());
        window.dispatchEvent(
            new KeyboardEvent('keydown', { key: 's', ctrlKey: false, metaKey: false, bubbles: true }),
        );
        expect(mockThemeAction).not.toHaveBeenCalled();
        expect(mockTerminalAction).not.toHaveBeenCalled();
    });

    it('should NOT trigger when an unregistered key + modifier is pressed', () => {
        renderHook(() => useShortcuts());
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', ctrlKey: true, bubbles: true }));
        expect(mockThemeAction).not.toHaveBeenCalled();
        expect(mockTerminalAction).not.toHaveBeenCalled();
    });

    // ── Input element guard ────────────────────────────────────────────────────

    it('should NOT trigger a shortcut when focused in an input element without modifier', () => {
        renderHook(() => useShortcuts());

        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        window.dispatchEvent(
            new KeyboardEvent('keydown', { key: 's', ctrlKey: false, metaKey: false, bubbles: true }),
        );
        expect(mockThemeAction).not.toHaveBeenCalled();

        document.body.removeChild(input);
    });

    it('should trigger shortcut even when focused in input if ctrl/meta modifier is held', () => {
        renderHook(() => useShortcuts());

        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));
        expect(mockThemeAction).toHaveBeenCalledTimes(1);

        document.body.removeChild(input);
    });

    // ── shortcutEventEmitter ───────────────────────────────────────────────────

    it('should dispatch toggleTheme event on the emitter when that shortcut fires', () => {
        renderHook(() => useShortcuts());

        const emitterCallback = vi.fn();
        const off = shortcutEventEmitter.on('toggleTheme', emitterCallback);

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));
        expect(emitterCallback).toHaveBeenCalledTimes(1);

        off(); // cleanup listener
    });

    it('should allow subscribing and unsubscribing from emitter events', () => {
        const cb = vi.fn();
        const off = shortcutEventEmitter.on('toggleTerminal', cb);
        shortcutEventEmitter.dispatch('toggleTerminal');
        expect(cb).toHaveBeenCalledTimes(1);

        off(); // unsubscribe
        shortcutEventEmitter.dispatch('toggleTerminal');
        expect(cb).toHaveBeenCalledTimes(1); // still 1 — callback was removed
    });
});
