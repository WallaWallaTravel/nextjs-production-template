/**
 * Zustand Store
 *
 * Centralized client-side state management.
 * Uses Zustand for its simplicity and React 18 compatibility.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============================================================================
// UI Store - Global UI State
// ============================================================================

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'system',
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: 'UI Store' }
  )
);

// ============================================================================
// Example: Feature Store with Immer
// ============================================================================

interface Item {
  id: string;
  name: string;
  completed: boolean;
}

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  addItem: (name: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  setItems: (items: Item[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useItemsStore = create<ItemsState>()(
  devtools(
    immer((set) => ({
      items: [],
      loading: false,
      error: null,

      addItem: (name) =>
        set((state) => {
          state.items.push({
            id: `item-${Date.now()}`,
            name,
            completed: false,
          });
        }),

      removeItem: (id) =>
        set((state) => {
          state.items = state.items.filter((item) => item.id !== id);
        }),

      toggleItem: (id) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);
          if (item) {
            item.completed = !item.completed;
          }
        }),

      setItems: (items) => set({ items }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    })),
    { name: 'Items Store' }
  )
);

// ============================================================================
// Store Utilities
// ============================================================================

/**
 * Create a simple store with common patterns
 * Uses plain state updates (no immer) for better type inference with generics
 */
export function createEntityStore<T extends { id: string }>(name: string) {
  return create<{
    entities: T[];
    loading: boolean;
    error: string | null;
    setEntities: (entities: T[]) => void;
    addEntity: (entity: T) => void;
    updateEntity: (id: string, updates: Partial<T>) => void;
    removeEntity: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  }>()(
    devtools(
      (set) => ({
        entities: [],
        loading: false,
        error: null,

        setEntities: (entities) => set({ entities }),

        addEntity: (entity) =>
          set((state) => ({
            entities: [...state.entities, entity],
          })),

        updateEntity: (id, updates) =>
          set((state) => ({
            entities: state.entities.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          })),

        removeEntity: (id) =>
          set((state) => ({
            entities: state.entities.filter((e) => e.id !== id),
          })),

        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
      }),
      { name }
    )
  );
}
