'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import DeleteButton from '@/components/delete-btn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/providers/supabase/client';
import { Textarea } from '@/components/ui/textarea';

interface Individual {
  id: number;
  first_name: string;
  last_name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  description: z.string().optional(),
});

interface IndividualFormProps {
  individual: Individual | null;
}

const IndividualForm: React.FC<IndividualFormProps> = ({ individual }) => {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: individual?.first_name ?? '',
      last_name: individual?.last_name ?? '',
      description: individual?.description ?? '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error } = await supabase
        .from('individuals')
        .upsert({
          first_name: values.first_name,
          last_name: values.last_name,
          description: values.description || null,
          ...(individual?.id && { id: individual.id }),
        })
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(individual ? 'Individual updated.' : 'Individual created.');

      if (!individual?.id) {
        router.push(`/individuals/${data.id}`);
      }

      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const onDelete = async () => {
    try {
      if (!individual?.id) return;

      const { error } = await supabase
        .from('individuals')
        .delete()
        .eq('id', individual.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Individual deleted.');
      router.push('/individuals');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <fieldset className="grid grid-cols-1 gap-2">
            {/* HEADER */}
            <Card>
              <CardHeader className="grid grid-cols-[1fr_auto] items-center gap-4">
                <CardTitle>
                  {individual
                    ? `${individual.first_name} ${individual.last_name}`
                    : 'New Individual'}
                </CardTitle>
                <div className="flex gap-2">
                  {individual && (
                    <DeleteButton label="Delete Individual" fn={onDelete} />
                  )}
                  <Button type="submit">
                    {individual ? 'Save changes' : 'Create'}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* DETAILS */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-2 gap-y-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </fieldset>
        </form>
      </Form>
    </div>
  );
};

export default IndividualForm;
