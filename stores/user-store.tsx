import { ProfilesWithRegistrations } from '@/types/types';
import { create } from 'zustand';

interface userStoreProps {
  profile: ProfilesWithRegistrations | null;
  setProfile: (c: ProfilesWithRegistrations) => void;
}

const userStore = create<userStoreProps>((set) => ({
  profile: null,
  setProfile: (c) => set({ profile: c }),
}));

export default userStore;
