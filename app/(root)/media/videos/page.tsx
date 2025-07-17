import { getMediaByType } from '@/actions/get-media';
import MediaClient from '../components/media-client';

export default async function VideosPage() {
  const videoFiles = await getMediaByType('video');

  return (
    <MediaClient
      initialMedia={videoFiles}
      mediaType="video"
      title="Videos"
      revalidatePath="/media/videos"
    />
  );
}