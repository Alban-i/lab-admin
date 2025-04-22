'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './data-table-column-header';
import { Profiles, Tasks } from '@/types/types';
import { format } from 'date-fns';
import { useProfiles } from '@/hooks/use-profiles';

export type TasksInDataTable = Tasks;

export type ExtendedColumnDef<T> = ColumnDef<T> & {
  label?: string;
};

const getOwnerName = (owner_id: string | null, profiles: Profiles[]) => {
  const owner = profiles.find((profile) => profile.id === owner_id);
  return (
    <div className="px-2 text-right">{owner?.full_name || 'Unassigned'}</div>
  );
};

// Wrapper component to use hooks
const OwnerCell = ({ ownerId }: { ownerId: string | null }) => {
  const profiles = useProfiles(
    (state: { profiles: Profiles[] }) => state.profiles
  );
  return getOwnerName(ownerId, profiles);
};

export const columns: ExtendedColumnDef<Tasks>[] = [
  {
    accessorKey: 'title',
    label: 'Title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="px-2 text-left font-medium">{row.original.title}</div>
      );
    },
  },
  {
    accessorKey: 'description',
    label: 'Description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="px-2 text-left">
          {row.original.description || 'No description'}
        </div>
      );
    },
  },
  {
    accessorKey: 'due_date',
    label: 'Due Date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const dueDate = row.original.due_date;
      return (
        <div className="px-2 text-right">
          {dueDate ? format(new Date(dueDate), 'PPP') : 'No due date'}
        </div>
      );
    },
  },
  {
    accessorKey: 'owner_id',
    label: 'Owner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    cell: ({ row }) => <OwnerCell ownerId={row.original.owner_id} />,
  },
];
