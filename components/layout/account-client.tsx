'use client';

import userStore from '@/stores/user-store';
import { ProfilesWithRegistrations } from '@/types/types';
import { useEffect } from 'react';

const AccountClient = ({ profile }: { profile: ProfilesWithRegistrations }) => {
  const { setProfile } = userStore();

  // ZUSTAND
  useEffect(() => {
    setProfile(profile);
  }, [profile, setProfile]);

  // FIXME
  if (true) {
    return <></>;
  }
};

export default AccountClient;
