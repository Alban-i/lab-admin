import { getMediaById } from '@/actions/get-media';
import { MediaForm } from '../../components/media-form';
import { notFound } from 'next/navigation';

interface AudioDetailPageProps {
  params: Promise<{
    mediaId: string;
  }>;
}

export default async function AudioDetailPage({ params }: AudioDetailPageProps) {
  const { mediaId } = await params;
  const media = await getMediaById(mediaId);

  if (!media || media.media_type !== 'audio') {
    notFound();
  }

  return <MediaForm media={media} />;
}