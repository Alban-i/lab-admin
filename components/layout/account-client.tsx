'use client';

import userStore from '@/stores/user-store';
import { ProfilesWithRoles } from '@/types/types';
import { useEffect } from 'react';

const AccountClient = ({ profile }: { profile: ProfilesWithRoles }) => {
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
