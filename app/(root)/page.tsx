'use client';

import { createClient } from '@/providers/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function HomePage() {
  // const {
  //   data: sessions = [],
  //   isLoading,
  //   isError,
  // } = useQuery({
  //   queryKey: ['sessions'],
  //   queryFn: async () => {
  //     const supabase = createClient();

  //     const { data, error } = await supabase
  //       .from('sessions')
  //       .select(
  //         `*
  //         , program!inner(category)
  //         , registrations(*, user_id(discount))
  //         `
  //       )
  //       .in('status', ['open', 'closed', 'ended'])
  //       .eq('program.category', 'advanced')
  //       .order('created_at', { ascending: false });

  //     if (error) {
  //       toast.error(error.message);
  //     }

  //     return data ?? [];
  //   },
  //   staleTime: 0,
  // });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Display loading, error, or session data */}
      {/* {isLoading && <p>Loading sessions...</p>}
      {isError && <p>Error loading sessions.</p>}
      {sessions && <div className="flex flex-col gap-4"></div>} */}
    </div>
  );
}
