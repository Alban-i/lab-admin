import getMyProfile from '@/actions/get-my-profile';
import AccountClient from './account-client';

const AccountServer = async () => {
  const profile = await getMyProfile();

  if (!profile) {
    return null;
  }

  return (
    <div>
      <AccountClient profile={profile} />
    </div>
  );
};

export default AccountServer;
