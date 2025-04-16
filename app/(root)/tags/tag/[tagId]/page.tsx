import { createClient } from '@/providers/supabase/server';
import TagForm from './components/tag-form';

const TagContentPage = async ({
  params,
}: {
  params: Promise<{ tagId: string }>;
}) => {
  const { tagId } = await params;
  const supabase = await createClient();

  // If tagId is 'new', return empty tag
  if (tagId === 'new') {
    return (
      <div className="">
        <TagForm tag={null} />
      </div>
    );
  }

  // Fetch existing tag
  const { data: tag, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', parseInt(tagId))
    .single();

  if (error) {
    console.error('Error fetching tag:', error);
    return <div className="px-4">No tag found.</div>;
  }

  return (
    <div className="">
      <TagForm tag={tag} />
    </div>
  );
};

export default TagContentPage;
