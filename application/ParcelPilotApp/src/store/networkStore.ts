import { create } from 'zustand';
import { Network } from '../models/Network';

interface NetworkStoreState {
  activeNetwork: Network | null;
  setActiveNetwork: (network: Network) => void;
  clearActiveNetwork: () => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  activeNetwork: null,
  
  setActiveNetwork: (network: Network) => {
    set({ activeNetwork: network });
  },
  
  clearActiveNetwork: () => {
    set({ activeNetwork: null });
  },
}));
