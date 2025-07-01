'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/providers/supabase/server';

// ##################### LOGIN  #####################
export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  let redirectPath: string | undefined = undefined;

  try {
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      return { ok: false, message: error.message };
    } else {
      redirectPath = '/';

      return { ok: true, message: 'All good' };
    }
  } catch (err) {
    return { ok: false, status: 500, message: (err as Error).message };
  } finally {
    if (redirectPath) {
      revalidatePath('/', 'layout');
      redirect(redirectPath);
    }
  }
}

// ##################### SIGN UP  #####################
export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  try {
    const { error } = await supabase.auth.signUp(data);

    if (error) {
      return { ok: false, message: error.message };
    } else {
      return {
        ok: true,
        message: 'Un email de confirmation vous a été envoyé.',
      };
    }
  } catch (err) {
    return { ok: false, status: 500, message: (err as Error).message };
  }

  //   revalidatePath('/', 'layout');
  //   redirect('/');
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;

  // Get the site URL from environment variables
  const siteUrl =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_FRONTEND_URL_DEV
      : process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/api/auth/confirm`,
    });

    if (error) {
      return { ok: false, message: error.message };
    } else {
      return {
        ok: true,
        message: 'Email envoyé pour générer un nouveau mot de passe.',
      };
    }
  } catch (err) {
    return { ok: false, status: 500, message: (err as Error).message };
  }
}
