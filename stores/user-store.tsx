import { ProfilesWithRoles } from '@/types/types';
import { create } from 'zustand';

interface userStoreProps {
  profile: ProfilesWithRoles | null;
  setProfile: (c: ProfilesWithRoles) => void;
}

const userStore = create<userStoreProps>((set) => ({
  profile: null,
  setProfile: (c) => set({ profile: c }),
}));

export default userStore;
