import { getMediaByType } from '@/actions/media/get-media';
import MediaClient from '../components/media-client';

export default async function ImagesPage() {
  const imageFiles = await getMediaByType('image');

  return (
    <MediaClient
      initialMedia={imageFiles}
      mediaType="image"
      title="Images"
      revalidatePath="/media/images"
    />
  );
}