import getIndividual from '@/actions/get-individual';
import getTypes from '@/actions/get-types';
import IndividualForm from './components/individual-form';

const IndividualPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  // Fetch types for the dropdown and individual data in parallel
  const [types, individual] = await Promise.all([
    getTypes(),
    getIndividual(slug),
  ]);

  // If slug is 'new', return empty individual
  if (slug === 'new') {
    return (
      <div className="">
        <IndividualForm individual={null} types={types || []} />
      </div>
    );
  }

  if (individual === 'error' || !individual) {
    return <div className="px-4">No individual found.</div>;
  }

  return (
    <div className="">
      <IndividualForm individual={individual} types={types || []} />
    </div>
  );
};

export default IndividualPage;
