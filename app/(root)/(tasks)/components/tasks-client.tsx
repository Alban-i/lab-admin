'use client';

import { Profiles, Tasks } from '@/types/types';
import { DataTable } from './data-table';
import { columns } from './columns';
import { RevalidateButton } from '@/components/revalidate-button';
import { useProfiles } from '@/hooks/use-profiles';
import { useEffect } from 'react';
import TaskDialog from './task-dialog';

interface TasksClientProps {
  tasks: Tasks[];
  profiles: Profiles[];
}

const TasksClient: React.FC<TasksClientProps> = ({ tasks, profiles }) => {
  const setProfiles = useProfiles(
    (state: { setProfiles: (profiles: Profiles[]) => void }) =>
      state.setProfiles
  );

  useEffect(() => {
    setProfiles(profiles);
  }, [profiles, setProfiles]);

  return (
    <div className="grid gap-3 px-4">
      {/* TOP FIRST LINE */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="ml-auto flex items-center gap-2">
          <RevalidateButton path="/" label="Revalidate Home Page" />
          <TaskDialog profiles={profiles} />
        </div>
      </div>

      <DataTable data={tasks} columns={columns} />
    </div>
  );
};

export default TasksClient;
