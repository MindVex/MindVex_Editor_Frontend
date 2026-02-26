import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Integration test — Editor File Flow
 *
 * This test suite verifies the interaction between the file store logic and
 * the workbench view state. It simulates the primary user flow of:
 *
 *   1. Opening a file → active tab is created & becomes the selected tab
 *   2. Modifying file content → tab becomes dirty
 *   3. Closing a dirty tab → unsaved-changes modal is triggered
 *   4. Saving (marking clean) → tab closes normally
 *   5. Switching views → workbench view state updates correctly
 *
 * Plain state objects are used (no real store imports) so the test runs in
 * isolation without a browser/WebContainer and without triggering complex
 * Nanostore subscriber chains.
 */

// ─── Types ────────────────────────────────────────────────────────────────────
interface FileTab {
    id: string;
    name: string;
    content: string;
    isDirty: boolean;
}

interface FileStoreState {
    activeTabs: FileTab[];
    selectedTabId: string | null;
    showUnsavedChangesModalForId: string | null;
}

interface WorkbenchState {
    showWorkbench: boolean;
    currentView: string;
    showTerminal: boolean;
}

// ─── Minimal store implementations ────────────────────────────────────────────
let fileState: FileStoreState;
let workbenchState: WorkbenchState;

const fileActions = {
    openFile(file: FileTab) {
        if (!fileState.activeTabs.find((t) => t.id === file.id)) {
            fileState.activeTabs = [...fileState.activeTabs, file];
        }
        fileState.selectedTabId = file.id;
    },
    updateContent(id: string, content: string) {
        fileState.activeTabs = fileState.activeTabs.map((t) =>
            t.id === id ? { ...t, content, isDirty: true } : t,
        );
    },
    saveFile(id: string) {
        fileState.activeTabs = fileState.activeTabs.map((t) =>
            t.id === id ? { ...t, isDirty: false } : t,
        );
    },
    closeFile(id: string) {
        const tab = fileState.activeTabs.find((t) => t.id === id);
        if (tab?.isDirty) {
            fileState.showUnsavedChangesModalForId = id;
            return; // Don't close yet
        }
        fileState.activeTabs = fileState.activeTabs.filter((t) => t.id !== id);
        if (fileState.selectedTabId === id) {
            fileState.selectedTabId = fileState.activeTabs[fileState.activeTabs.length - 1]?.id ?? null;
        }
    },
    forceClose(id: string) {
        fileState.activeTabs = fileState.activeTabs.filter((t) => t.id !== id);
        fileState.showUnsavedChangesModalForId = null;
        if (fileState.selectedTabId === id) {
            fileState.selectedTabId = fileState.activeTabs[fileState.activeTabs.length - 1]?.id ?? null;
        }
    },
    selectTab(id: string) {
        fileState.selectedTabId = id;
    },
};

const workbenchActions = {
    setShowWorkbench(value: boolean) {
        workbenchState.showWorkbench = value;
    },
    setCurrentView(view: string) {
        workbenchState.currentView = view;
    },
    toggleTerminal(value: boolean) {
        workbenchState.showTerminal = value;
    },
};

// ─── Reset state before each test ─────────────────────────────────────────────
beforeEach(() => {
    fileState = {
        activeTabs: [],
        selectedTabId: null,
        showUnsavedChangesModalForId: null,
    };
    workbenchState = {
        showWorkbench: false,
        currentView: 'code',
        showTerminal: false,
    };
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Editor File Flow — Opening Files', () => {
    it('should add a file to activeTabs when opened', () => {
        fileActions.openFile({ id: 'f1', name: 'index.ts', content: '', isDirty: false });
        expect(fileState.activeTabs).toHaveLength(1);
        expect(fileState.activeTabs[0].name).toBe('index.ts');
    });

    it('should automatically select the opened file', () => {
        fileActions.openFile({ id: 'f1', name: 'index.ts', content: '', isDirty: false });
        expect(fileState.selectedTabId).toBe('f1');
    });

    it('should not create duplicate tabs when the same file is opened twice', () => {
        const file = { id: 'f1', name: 'index.ts', content: '', isDirty: false };
        fileActions.openFile(file);
        fileActions.openFile(file);
        expect(fileState.activeTabs).toHaveLength(1);
    });

    it('should update selectedTabId when switching between open files', () => {
        fileActions.openFile({ id: 'f1', name: 'a.ts', content: '', isDirty: false });
        fileActions.openFile({ id: 'f2', name: 'b.ts', content: '', isDirty: false });
        fileActions.selectTab('f1');
        expect(fileState.selectedTabId).toBe('f1');
    });

    it('should allow multiple files to be open simultaneously', () => {
        fileActions.openFile({ id: 'f1', name: 'a.ts', content: '', isDirty: false });
        fileActions.openFile({ id: 'f2', name: 'b.ts', content: '', isDirty: false });
        fileActions.openFile({ id: 'f3', name: 'c.ts', content: '', isDirty: false });
        expect(fileState.activeTabs).toHaveLength(3);
    });
});

describe('Editor File Flow — Modifying Files', () => {
    beforeEach(() => {
        fileActions.openFile({ id: 'f1', name: 'main.ts', content: 'const x = 1;', isDirty: false });
    });

    it('should mark a tab as dirty when content changes', () => {
        fileActions.updateContent('f1', 'const x = 99;');
        const tab = fileState.activeTabs.find((t) => t.id === 'f1');
        expect(tab?.isDirty).toBe(true);
    });

    it('should update the content in the active tab', () => {
        fileActions.updateContent('f1', 'const x = 42;');
        const tab = fileState.activeTabs.find((t) => t.id === 'f1');
        expect(tab?.content).toBe('const x = 42;');
    });

    it('should mark a tab as clean after saving', () => {
        fileActions.updateContent('f1', 'new content');
        fileActions.saveFile('f1');
        const tab = fileState.activeTabs.find((t) => t.id === 'f1');
        expect(tab?.isDirty).toBe(false);
    });
});

describe('Editor File Flow — Closing Tabs', () => {
    beforeEach(() => {
        fileActions.openFile({ id: 'f1', name: 'app.ts', content: '', isDirty: false });
        fileActions.openFile({ id: 'f2', name: 'utils.ts', content: '', isDirty: false });
    });

    it('should remove a clean tab when closed', () => {
        fileActions.closeFile('f1');
        expect(fileState.activeTabs.some((t) => t.id === 'f1')).toBe(false);
    });

    it('should NOT remove a dirty tab immediately — should show the modal', () => {
        fileActions.updateContent('f1', 'unsaved change');
        fileActions.closeFile('f1');
        expect(fileState.activeTabs.some((t) => t.id === 'f1')).toBe(true);
        expect(fileState.showUnsavedChangesModalForId).toBe('f1');
    });

    it('should set the next available tab as selected after closing current', () => {
        fileActions.selectTab('f1');
        fileActions.closeFile('f1');
        expect(fileState.selectedTabId).toBe('f2');
    });

    it('should set selectedTabId to null when the last tab is closed', () => {
        fileActions.closeFile('f1');
        fileActions.closeFile('f2');
        expect(fileState.selectedTabId).toBeNull();
    });

    it('should force-close a dirty tab and clear the modal', () => {
        fileActions.updateContent('f1', 'unsaved content');
        fileActions.closeFile('f1'); // triggers modal
        fileActions.forceClose('f1'); // user confirms
        expect(fileState.activeTabs.some((t) => t.id === 'f1')).toBe(false);
        expect(fileState.showUnsavedChangesModalForId).toBeNull();
    });
});

describe('Workbench View State — Integration with editor flow', () => {
    it('should show the workbench when a file is opened', () => {
        fileActions.openFile({ id: 'f1', name: 'index.ts', content: '', isDirty: false });
        workbenchActions.setShowWorkbench(true);
        expect(workbenchState.showWorkbench).toBe(true);
    });

    it('should switch view to "diff" when comparing file changes', () => {
        workbenchActions.setCurrentView('diff');
        expect(workbenchState.currentView).toBe('diff');
    });

    it('should toggle the terminal panel independently of the editor', () => {
        workbenchActions.toggleTerminal(true);
        expect(workbenchState.showTerminal).toBe(true);
        workbenchActions.toggleTerminal(false);
        expect(workbenchState.showTerminal).toBe(false);
    });

    it('should support switching between all known view types', () => {
        const views = ['code', 'diff', 'preview', 'dashboard', 'quick-actions', 'arch-graph'];
        views.forEach((view) => {
            workbenchActions.setCurrentView(view);
            expect(workbenchState.currentView).toBe(view);
        });
    });

    it('should manage a multi-file editing session end-to-end', () => {
        // 1. Open two files
        fileActions.openFile({ id: 'a', name: 'a.ts', content: 'const a = 1;', isDirty: false });
        fileActions.openFile({ id: 'b', name: 'b.ts', content: 'const b = 2;', isDirty: false });
        workbenchActions.setShowWorkbench(true);

        // 2. Edit file A
        fileActions.updateContent('a', 'const a = 100;');
        expect(fileState.activeTabs.find((t) => t.id === 'a')?.isDirty).toBe(true);

        // 3. Save file A
        fileActions.saveFile('a');
        expect(fileState.activeTabs.find((t) => t.id === 'a')?.isDirty).toBe(false);

        // 4. Close both files
        fileActions.closeFile('a');
        fileActions.closeFile('b');
        expect(fileState.activeTabs).toHaveLength(0);
        expect(fileState.selectedTabId).toBeNull();
    });
});
