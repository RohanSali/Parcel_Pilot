import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
}

interface NotificationStoreState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => {
    const newNotif: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      date: 'Just now' // In a real app, use timestamp
    };
    return { notifications: [newNotif, ...state.notifications] };
  }),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearAll: () => set({ notifications: [] }),
}));
