import { createClient } from '@/providers/supabase/server';
import IndividualForm from './components/individual-form';

const IndividualPage = async ({
  params,
}: {
  params: Promise<{ individualId: string }>;
}) => {
  const { individualId } = await params;
  const supabase = await createClient();

  // Fetch types for the dropdown
  const { data: types, error: typesError } = await supabase
    .from('types')
    .select('id, name')
    .order('name');

  if (typesError) {
    console.error('Error fetching types:', typesError);
  }

  // If individualId is 'new', return empty individual
  if (individualId === 'new') {
    return (
      <div className="">
        <IndividualForm individual={null} types={types || []} />
      </div>
    );
  }

  // Fetch existing individual
  const { data: individual, error } = await supabase
    .from('individuals')
    .select('*')
    .eq('id', parseInt(individualId))
    .single();

  if (error) {
    console.error('Error fetching individual:', error);
    return <div className="px-4">No individual found.</div>;
  }

  return (
    <div className="">
      <IndividualForm individual={individual} types={types || []} />
    </div>
  );
};

export default IndividualPage;
