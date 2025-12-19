import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, User, Log, CreateLog } from '@/lib/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.auth.login(email, password);
          set({ token: res.accessToken, user: res.user, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
          throw err;
        }
      },
      
      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.auth.register(email, password);
          set({ token: res.accessToken, user: res.user, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
          throw err;
        }
      },
      
      logout: () => {
        set({ token: null, user: null });
      },
      
      clearError: () => set({ error: null }),
    }),
    { name: 'evident-auth' }
  )
);

interface LogsState {
  logs: Log[];
  view: 'today' | 'this-week' | 'last-week';
  isLoading: boolean;
  error: string | null;
  setView: (view: 'today' | 'this-week' | 'last-week') => void;
  fetchLogs: () => Promise<void>;
  createLog: (log: CreateLog) => Promise<void>;
  updateLog: (id: string, log: Partial<CreateLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  view: 'today',
  isLoading: false,
  error: null,
  
  setView: (view) => {
    set({ view });
    get().fetchLogs();
  },
  
  fetchLogs: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    set({ isLoading: true, error: null });
    try {
      const { view } = get();
      let logs: Log[];
      
      switch (view) {
        case 'today':
          logs = await api.logs.today(token);
          break;
        case 'this-week':
          logs = await api.logs.thisWeek(token);
          break;
        case 'last-week':
          logs = await api.logs.lastWeek(token);
          break;
      }
      
      set({ logs, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
  
  createLog: async (log) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    try {
      await api.logs.create(token, { ...log, source: 'WEB' });
      get().fetchLogs();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
  
  updateLog: async (id, log) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    try {
      await api.logs.update(token, id, log);
      get().fetchLogs();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
  
  deleteLog: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    try {
      await api.logs.delete(token, id);
      get().fetchLogs();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
