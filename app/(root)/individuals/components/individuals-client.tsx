'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { DataTable } from './data-table';

interface Individual {
  id: number;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface IndividualsClientProps {
  individuals: Individual[];
}

const IndividualsClient: React.FC<IndividualsClientProps> = ({
  individuals,
}) => {
  const router = useRouter();

  return (
    <div className="grid gap-3 px-4">
      {/* TOP FIRST LINE */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Individuals</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={() => router.push('/individuals/new')}>
            Add New Individual
          </Button>
        </div>
      </div>

      <DataTable data={individuals} columns={columns} />
    </div>
  );
};

export default IndividualsClient;
