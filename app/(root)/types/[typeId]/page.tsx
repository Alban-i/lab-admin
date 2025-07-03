import { createClient } from '@/providers/supabase/server';
import TypeForm from './components/type-form';

const TypeContentPage = async ({
  params,
}: {
  params: Promise<{ typeId: string }>;
}) => {
  const { typeId } = await params;
  const supabase = await createClient();

  // If typeId is 'new', return empty type
  if (typeId === 'new') {
    return (
      <div className="">
        <TypeForm type={null} />
      </div>
    );
  }

  // Fetch existing type
  const { data: type, error } = await supabase
    .from('types')
    .select('*')
    .eq('id', typeId)
    .single();

  if (error) {
    console.error('Error fetching type:', error);
    return <div className="px-4">No type found.</div>;
  }

  return (
    <div className="">
      <TypeForm type={type} />
    </div>
  );
};

export default TypeContentPage;
