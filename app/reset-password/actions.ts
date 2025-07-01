'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/providers/supabase/server';

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get('password') as string;

  try {
    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    // Revalidate and redirect to dashboard
    revalidatePath('/', 'layout');
    redirect('/');
  } catch (err) {
    return { ok: false, status: 500, message: (err as Error).message };
  }
}
