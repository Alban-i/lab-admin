'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import DeleteButton from '@/components/delete-btn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/providers/supabase/client';
import Editor from '@/components/editor';
import { TabToggle } from '@/components/ui/tab-toggle';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';

const initialData = {
  title: '',
  summary: '',
  content: '',
  slug: '',
  status: 'draft',
  is_published: false,
  category_id: null,
  id: undefined,
  published_at: null,
};

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

const formSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  slug: z.string().min(1),
  category_id: z.string().optional(),
});

interface ArticleFormProps {
  article:
    | (Omit<
        {
          id: string;
          title: string;
          content: string;
          summary: string;
          slug: string;
          status: string;
          is_published: boolean | null;
          author_id: string | null;
          published_at: string | null;
          created_at: string | null;
          updated_at: string | null;
          category_id: string | null;
        },
        'created_at'
      > & { id?: string })
    | null;
  categories: Category[];
  tags: Tag[];
  selectedTagIds: number[];
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  categories,
  tags,
  selectedTagIds,
}) => {
  const defaultValues = article ?? initialData;
  const [content, setContent] = useState<string>(defaultValues.content ?? '');
  const [loading, setLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>(selectedTagIds);
  type ArticleStatus = 'draft' | 'published' | 'archived';
  const [status, setStatus] = useState<ArticleStatus>(
    defaultValues.status as ArticleStatus
  );

  const supabase = createClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues.title ?? '',
      summary: defaultValues.summary ?? '',
      slug: defaultValues.slug ?? '',
      category_id: defaultValues.category_id?.toString() ?? undefined,
    },
  });

  // Labels
  const toastMessage = defaultValues.id
    ? 'Article updated.'
    : 'Article created.';
  const action = defaultValues.id ? 'Save changes' : 'Create';

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const articleData = {
        title: values.title,
        summary: values.summary,
        content: content,
        slug: values.slug,
        status,
        published_at:
          status === 'published' && defaultValues.status !== 'published'
            ? new Date().toISOString()
            : defaultValues.published_at,
        category_id: values.category_id ? Number(values.category_id) : null,
        ...(defaultValues.id && { id: defaultValues.id }),
      };

      const { data, error } = await supabase
        .from('articles')
        .upsert(articleData)
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Calculate tag differences
      const tagsToAdd = selectedTags.filter(
        (tagId) => !selectedTagIds.includes(tagId)
      );
      const tagsToRemove = selectedTagIds.filter(
        (tagId) => !selectedTags.includes(tagId)
      );

      // Remove unselected tags
      if (tagsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('article_tags')
          .delete()
          .eq('article_id', data.id)
          .in('tag_id', tagsToRemove);

        if (deleteError) {
          toast.error('Failed to remove tags');
          console.error('Error removing tags:', deleteError);
        }
      }

      // Add new tags
      if (tagsToAdd.length > 0) {
        const tagData = tagsToAdd.map((tagId) => ({
          article_id: data.id,
          tag_id: tagId,
        }));

        const { error: insertError } = await supabase
          .from('article_tags')
          .insert(tagData);

        if (insertError) {
          toast.error('Failed to add new tags');
          console.error('Error adding tags:', insertError);
        }
      }

      form.reset({
        title: data.title ?? '',
        summary: data.summary ?? '',
        slug: data.slug ?? '',
        category_id: data.category_id?.toString() ?? undefined,
      });

      toast.success(toastMessage);

      if (!defaultValues.id) {
        router.push(`/articles/article/${data.id}`);
      }

      router.refresh();
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!defaultValues.id) {
      toast.error('Article not found');
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', defaultValues.id);

      if (error) {
        toast.error(error.message);
        setLoading(false);
      }

      toast.success('Article deleted.');

      router.push('/articles');

      form.reset();
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong when trying to delete');
    }
  };

  const generateSummary = async () => {
    if (!content) {
      toast.error('Please add some content first');
      return;
    }

    try {
      setIsGeneratingSummary(true);
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate summary');
      }

      const data = await response.json();
      form.setValue('summary', data.summary);
      toast.success('Summary generated successfully');
    } catch (error) {
      toast.error('Failed to generate summary');
      console.error('Error generating summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <fieldset disabled={loading} className="grid grid-cols-1 gap-2">
            {/* HEADER */}
            <Card>
              <CardHeader className="grid grid-cols-[1fr_auto] items-center gap-4">
                <CardTitle>
                  {defaultValues.id ? defaultValues.title : 'New article'}
                </CardTitle>
                <div className="flex gap-2">
                  {defaultValues.id && (
                    <DeleteButton label="Delete Article" fn={onDelete} />
                  )}
                  <Button type="submit">{action}</Button>
                </div>
              </CardHeader>
            </Card>

            {/* DETAILS */}
            <Card>
              <CardHeader>
                <CardTitle>Article Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-2 gap-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Article Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="article-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="">
                  <FormLabel className="mb-2">Status</FormLabel>
                  <TabToggle
                    state={status}
                    setState={(value) => setStatus(value as ArticleStatus)}
                    picklist={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'published', label: 'Published' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* TAGS */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant={
                        selectedTags.includes(tag.id) ? 'default' : 'outline'
                      }
                      size="sm"
                      className="rounded-full"
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SUMMARY */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Summary</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateSummary}
                    disabled={isGeneratingSummary}
                  >
                    {isGeneratingSummary ? (
                      'Generating...'
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Article summary..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* CONTENT */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Editor content={content} onChange={setContent} />
              </CardContent>
            </Card>
          </fieldset>
        </form>
      </Form>
    </div>
  );
};

export default ArticleForm;
