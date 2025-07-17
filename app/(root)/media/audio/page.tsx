import { getMediaByType } from '@/actions/get-media';
import MediaClient from '../components/media-client';

export default async function AudioPage() {
  const audioFiles = await getMediaByType('audio');

  return (
    <MediaClient
      initialMedia={audioFiles}
      mediaType="audio"
      title="Audio Files"
      revalidatePath="/media/audio"
    />
  );
}