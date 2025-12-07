import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserSession {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        role: string;
    } | null;
    isAuthenticated: boolean;
}

interface UIState {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

interface AppState extends UIState {
    session: UserSession;
    setSession: (session: UserSession) => void;
    clearSession: () => void;

    // Global counters
    unreadMessages: number;
    setUnreadMessages: (count: number) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // Session State
            session: {
                user: null,
                isAuthenticated: false,
            },
            setSession: (session) => set({ session }),
            clearSession: () => set({ session: { user: null, isAuthenticated: false } }),

            // UI State
            theme: 'system',
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setTheme: (theme) => set({ theme }),

            // Global Counters
            unreadMessages: 0,
            setUnreadMessages: (count) => set({ unreadMessages: count }),
        }),
        {
            name: 'app-storage',
            partialize: (state) => ({
                theme: state.theme,
                sidebarOpen: state.sidebarOpen
            }), // Only persist UI state, not session (handled by auth)
        }
    )
);
