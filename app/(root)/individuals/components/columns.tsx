'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './data-table-column-header';

export type IndividualsInDataTable = {
  id: number;
  first_name: string;
  last_name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
};

// Extend the ColumnDef type to include the label property
export type ExtendedColumnDef<T> = ColumnDef<T> & {
  label?: string;
};

export const columns: ExtendedColumnDef<IndividualsInDataTable>[] = [
  {
    accessorKey: 'first_name',
    label: 'First Name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="px-2 text-left font-medium">
          {row.original.first_name}
        </div>
      );
    },
  },
  {
    accessorKey: 'last_name',
    label: 'Last Name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="px-2 text-left font-medium">
          {row.original.last_name}
        </div>
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
        <div className="px-2 text-left font-medium">
          {row.original.description}
        </div>
      );
    },
  },
  {
    accessorKey: 'created_at',
    label: 'Created At',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="px-2 text-left font-medium">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </div>
      );
    },
  },
  {
    accessorKey: 'updated_at',
    label: 'Updated At',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="px-2 text-left font-medium">
          {row.original.updated_at
            ? new Date(row.original.updated_at).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </div>
      );
    },
  },
];
