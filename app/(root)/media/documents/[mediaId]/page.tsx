import { getMediaById } from '@/actions/media/get-media';
import { MediaForm } from '../../components/media-form';
import { notFound } from 'next/navigation';

interface DocumentDetailPageProps {
  params: Promise<{
    mediaId: string;
  }>;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { mediaId } = await params;
  const media = await getMediaById(mediaId);

  if (!media || media.media_type !== 'document') {
    notFound();
  }

  return <MediaForm media={media} />;
}