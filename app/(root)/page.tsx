import getTasks from '@/actions/get-tasks';
import getAuthors from '@/actions/get-authors';
import TasksClient from './(tasks)/components/tasks-client';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevalidateButton } from '@/components/revalidate-button';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tasks = await getTasks();
  const profiles = await getAuthors();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card>
        <CardHeader>
          <CardTitle>Revalidation</CardTitle>
        </CardHeader>
        <CardContent>
          <RevalidateButton path="/" label="Revalidate Home Page" />
        </CardContent>
      </Card>
      <Separator />
      <TasksClient tasks={tasks} profiles={profiles} />
    </div>
  );
}
