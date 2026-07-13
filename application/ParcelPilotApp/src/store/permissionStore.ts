import { create } from 'zustand';

interface PermissionStoreState {
  permissions: string[]; // Active list of permission keys based on user's role in the active network
  setPermissions: (permissions: string[]) => void;
  hasPermission: (key: string) => boolean;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionStoreState>((set, get) => ({
  permissions: [],
  
  setPermissions: (permissions: string[]) => {
    set({ permissions });
  },
  
  hasPermission: (key: string) => {
    const { permissions } = get();
    // In actual implementation, SuperAdmin might have all implicitly, 
    // but here we just check the array.
    return permissions.includes(key);
  },
  
  clearPermissions: () => {
    set({ permissions: [] });
  },
}));
