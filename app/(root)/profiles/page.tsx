import getProfiles from '@/actions/get-profiles';
import ProfilesClient from './components/profiles-client';
import wait from '@/hooks/use-wait';
const ProfilesPage = async () => {
  const profiles = await getProfiles();

  await wait(5000);

  return (
    <div className="">
      <ProfilesClient profiles={profiles} />
    </div>
  );
};

export default ProfilesPage;
