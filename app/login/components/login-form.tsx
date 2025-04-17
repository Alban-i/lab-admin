'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { toast } from 'sonner';
import { login, resetPassword, signup } from '../actions';
import { createClient } from '@/providers/supabase/client';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

const url =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_FRONTEND_URL_DEV
    : process.env.NEXT_PUBLIC_SITE_URL;

export function LoginForm() {
  // const pathname = usePathname();
  const pathname = '/';
  const [scenario, setScenario] = useState<
    'login' | 'signup' | 'resetpassword'
  >('login');
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email({ message: 'Adresse email invalide.' }),
    password: z
      .string()
      .min(8, {
        message: 'Le mot de passe doit contenir au moins 8 caractères.',
      })
      .regex(/[a-zA-Z]/, {
        message: 'Le mot de passe doit contenir au moins une lettre.',
      })
      .regex(/[0-9]/, {
        message: 'Le mot de passe doit contenir au moins un chiffre.',
      })
      .refine((val) => scenario === 'resetpassword' || val !== '', {
        message:
          'Le mot de passe est requis sauf si vous réinitialisez le mot de passe.',
      })
      .or(z.literal('')), // Allow empty password if scenario is 'resetpassword'
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);

    // On n'utilise pas de Try, car la logique est gérée dans actions.ts
    let response;
    if (scenario === 'login') {
      response = await login(formData);
    } else if (scenario === 'signup') {
      response = await signup(formData);
    } else if (scenario === 'resetpassword') {
      response = await resetPassword(formData);
    }

    // Si tout fonctionne, on ne retourne rien, donc response = undefined
    // On ne retourne rien car on utilise le redirect de nextjs dans actions.ts
    if (response && !response.ok) {
      setLoading(false);
      return toast.error(response ? response.message : 'Unknown error');
    }

    if (scenario === 'signup' || scenario === 'resetpassword') {
      toast.success(response?.message);
    } else {
      setLoading(false);
    }
  }

  // ##################### LOGIN  GOOGLE #####################
  async function signInWithGoogle() {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: url + '/api/auth/callback?next=' + pathname,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  }

  // ##################### LOGIN  MICROSOFT #####################
  async function signInWithAzure() {
    const supabase = await createClient();

    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: url + '/api/auth/callback?next=' + pathname,
        scopes: 'email GroupMember.Read.All openid profile User.Read',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  }

  const title =
    scenario === 'login'
      ? 'Se connecter'
      : scenario === 'signup'
      ? 'Créer un compte'
      : 'Nouveau mot de passe';

  return (
    <Card className="mx-auto max-w-sm min-w-80">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            className="py-8"
            variant="outline"
            onClick={signInWithGoogle}
            style={{ direction: 'ltr' }}
          >
            <Image
              src="/images/google.svg"
              alt="Google Logo"
              width={25}
              height={25}
              className="mr-0"
            />
            <span className="font-semibold">Google</span>
          </Button>
          <Button
            type="button"
            className="py-8"
            variant="outline"
            onClick={signInWithAzure}
            style={{ direction: 'ltr' }}
          >
            <Image
              src="/images/microsoft.svg"
              alt="Microsoft Logo"
              width={25}
              height={25}
              className="mr-0"
            />
            <span className="font-semibold">Microsoft</span>
          </Button>
        </div>

        <Separator className="my-4" /> */}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={loading}>
              <div className="grid gap-4">
                {/* EMAIL */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="a@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PASSWORD */}
                {scenario !== 'resetpassword' && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Mot de passe
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="mot de passe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {scenario === 'login' && (
                  <Button type="submit" className="w-full mt-2 ">
                    Se connecter
                  </Button>
                )}

                {scenario === 'signup' && (
                  <Button type="submit" className="w-full mt-2 bg-sky-700">
                    Créer un compte
                  </Button>
                )}

                {scenario === 'resetpassword' && (
                  <Button type="submit" className="w-full mt-2 bg-sky-700">
                    Changer de mot de passe
                  </Button>
                )}

                {/* FOOTER */}
                <div className="grid grid-cols-1 gap-2">
                  {(scenario === 'login' || scenario === 'signup') && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="underline"
                      onClick={() => setScenario('resetpassword')}
                    >
                      Mot de passe oublié ?
                    </Button>
                  )}

                  {(scenario === 'login' || scenario === 'resetpassword') && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="underline"
                      onClick={() => setScenario('signup')}
                    >
                      Créer un compte
                    </Button>
                  )}

                  {(scenario === 'signup' || scenario === 'resetpassword') && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="underline"
                      onClick={() => setScenario('login')}
                    >
                      Compte existant ?
                    </Button>
                  )}
                </div>
              </div>
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
