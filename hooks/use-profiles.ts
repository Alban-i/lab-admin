import { create } from 'zustand';
import { Profiles } from '@/types/types';

interface ProfilesStore {
  profiles: Profiles[];
  setProfiles: (profiles: Profiles[]) => void;
}

export const useProfiles = create<ProfilesStore>((set) => ({
  profiles: [],
  setProfiles: (profiles) => set({ profiles }),
}));
