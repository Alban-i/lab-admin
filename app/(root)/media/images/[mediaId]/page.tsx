import { getMediaById } from '@/actions/media/get-media';
import { MediaForm } from '../../components/media-form';
import { notFound } from 'next/navigation';

interface ImageDetailPageProps {
  params: Promise<{
    mediaId: string;
  }>;
}

export default async function ImageDetailPage({ params }: ImageDetailPageProps) {
  const { mediaId } = await params;
  const media = await getMediaById(mediaId);

  if (!media || media.media_type !== 'image') {
    notFound();
  }

  return <MediaForm media={media} />;
}