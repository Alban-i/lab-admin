import { getMediaById } from '@/actions/media/get-media';
import { MediaForm } from '../../components/media-form';
import { notFound } from 'next/navigation';

interface VideoDetailPageProps {
  params: Promise<{
    mediaId: string;
  }>;
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { mediaId } = await params;
  const media = await getMediaById(mediaId);

  if (!media || media.media_type !== 'video') {
    notFound();
  }

  return <MediaForm media={media} />;
}