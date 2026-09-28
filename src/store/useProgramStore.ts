import { create } from 'zustand';

export interface Category {
    id: number;
    name: string;
    parent: number;
    sortorder: number;
    description?: string;
    tuition?: string;
    access_fee?: string;
    duration?: string;
    meta?: Array<string | number>;
}

export interface CategoryNode extends Category {
    children: CategoryNode[];
}

interface ProgramStore {
    // Raw flat data from API
    categories: Category[];
    // Tree structure derived from flat data
    categoryTree: CategoryNode[];
    // Navigation breadcrumb stack — each entry is the node the user drilled into
    navigationStack: CategoryNode[];
    // The final selected leaf node
    selectedProgram: CategoryNode | null;

    // Actions
    setCategories: (categories: Category[]) => void;
    drillInto: (node: CategoryNode) => void;
    goBack: () => void;
    selectProgram: (node: CategoryNode) => void;
    clearSelection: () => void;
    resetNavigation: () => void;
}

/** Recursively build a tree from flat parent-child data */
function buildTree(items: Category[], parentId: number = 0): CategoryNode[] {
    return items
        .filter((item) => item.parent === parentId)
        .sort((a, b) => a.sortorder - b.sortorder)
        .map((item) => ({
            ...item,
            children: buildTree(items, item.id),
        }));
}

export const useProgramStore = create<ProgramStore>((set, get) => ({
    categories: [],
    categoryTree: [],
    navigationStack: [],
    selectedProgram: null,

    setCategories: (categories) => {
        const categoryTree = buildTree(categories);
        set({ categories, categoryTree });
    },

    drillInto: (node) => {
        set((state) => ({
            navigationStack: [...state.navigationStack, node],
        }));
    },

    goBack: () => {
        set((state) => ({
            navigationStack: state.navigationStack.slice(0, -1),
        }));
    },

    selectProgram: (node) => {
        set({ selectedProgram: node });
    },

    clearSelection: () => {
        set({ selectedProgram: null });
    },

    resetNavigation: () => {
        set({ navigationStack: [], selectedProgram: null });
    },
}));