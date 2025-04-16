import { createClient } from '@/providers/supabase/server';
import RoleForm from './components/role-form';

const RoleContentPage = async ({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) => {
  const { roleId } = await params;
  const supabase = await createClient();

  // If roleId is 'new', return empty role
  if (roleId === 'new') {
    return (
      <div className="">
        <RoleForm role={null} />
      </div>
    );
  }

  // Fetch existing role
  const { data: role, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', parseInt(roleId))
    .single();

  if (error) {
    console.error('Error fetching role:', error);
    return <div className="px-4">No role found.</div>;
  }

  return (
    <div className="">
      <RoleForm role={role} />
    </div>
  );
};

export default RoleContentPage;
