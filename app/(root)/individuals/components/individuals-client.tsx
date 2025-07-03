'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { DataTable } from './data-table';
import { RevalidateButton } from '@/components/revalidate-button';

interface Individual {
  id: number;
  name: string;
  description: string | null;
  type_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  types?: {
    name: string;
  } | null;
}

interface IndividualsClientProps {
  individuals: Individual[];
}

const IndividualsClient: React.FC<IndividualsClientProps> = ({
  individuals,
}) => {
  const router = useRouter();

  // Map the data to include type_name for the table
  const mappedData = individuals.map((individual) => ({
    ...individual,
    type_name: individual.types?.name || null,
  }));

  return (
    <div className="grid gap-3 px-4">
      {/* TOP FIRST LINE */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Individuals</h2>
        <div className="ml-auto flex items-center gap-2">
          <RevalidateButton
            path="/individuals"
            label="Revalidate Individuals Page"
          />
          <Button onClick={() => router.push('/individuals/new')}>
            Add New Individual
          </Button>
        </div>
      </div>

      <DataTable data={mappedData} columns={columns} />
    </div>
  );
};

export default IndividualsClient;
