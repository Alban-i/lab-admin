'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import dynamic from 'next/dynamic';
import {
  Articles,
  ProfilesWithRoles,
  Tags,
  ArticleStatus,
} from '@/types/types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/providers/supabase/client';
import { TabToggle } from '@/components/ui/tab-toggle';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';
import ImageUpload from '@/components/image-upload';
import { RevalidateButton } from '@/components/revalidate-button';
import { UsedMediaCard } from '@/components/media/used-media-card';

// Dynamically import Editor with SSR disabled to prevent Vercel hydration issues
const Editor = dynamic(() => import('@/components/tiptap/editor'), {
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">Loading editor...</div>
});

const initialData = {
  title: '',
  summary: '',
  content: '',
  slug: '',
  status: 'draft',
  category_id: null,
  author_id: null,
  id: undefined,
  published_at: null,
  is_featured: false,
  image_url: '',
} as const;

const formSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  slug: z.string().min(1),
  category_id: z.string().optional(),
  author_id: z.string().min(1, 'Author is required'),
  is_featured: z.boolean(),
  image_url: z.string().optional(),
});

interface ArticleFormProps {
  article: (Omit<Articles, 'is_published'> & { id?: string }) | null;
  categories: { id: number; name: string }[];
  tags: { id: number; name: string; created_at: string; updated_at: string }[];
  selectedTagIds: number[];
  authors: ProfilesWithRoles[];
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  categories,
  tags,
  selectedTagIds,
  authors,
}) => {
  const defaultValues = article ?? { ...initialData, is_featured: false };
  const [content, setContent] = useState<string>(defaultValues.content ?? '');
  const [loading, setLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>(selectedTagIds);
  type FormStatus = 'draft' | 'published' | 'archived';
  const [status, setStatus] = useState<FormStatus>(
    (defaultValues.status?.toLowerCase() as FormStatus) ?? 'draft'
  );

  const supabase = createClient();
  const router = useRouter();

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues.title ?? '',
      summary: defaultValues.summary ?? '',
      slug: defaultValues.slug ?? '',
      category_id: defaultValues.category_id?.toString() ?? undefined,
      author_id: defaultValues.author_id?.toString() ?? undefined,
      is_featured: defaultValues.is_featured ?? false,
      image_url: defaultValues.image_url ?? '',
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
        is_featured: values.is_featured,
        image_url: values.image_url,
        published_at:
          status === 'published' &&
          defaultValues.status?.toLowerCase() !== 'published'
            ? new Date().toISOString()
            : defaultValues.published_at,
        category_id: values.category_id ? Number(values.category_id) : null,
        author_id: values.author_id || null,
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
        author_id: data.author_id?.toString() ?? undefined,
        is_featured: data.is_featured ?? false,
        image_url: data.image_url ?? '',
      });

      toast.success(toastMessage);

      if (!defaultValues.id) {
        router.push(`/articles/${data.slug}`);
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
          <fieldset
            disabled={loading}
            className="grid md:grid-cols-[2fr_1fr] gap-4"
          >
            {/* Left Column */}
            <div className="space-y-4">
              {/* HEADER */}
              <Card>
                <CardHeader className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <CardTitle>
                    {defaultValues.id ? defaultValues.title : 'New article'}
                  </CardTitle>
                  <div className="flex gap-2">
                    {defaultValues.id && (
                      <>
                        <RevalidateButton
                          path={`/articles/${form.getValues('slug')}`}
                          label="Revalidate Article Page"
                        />
                        <DeleteButton label="Delete Article" fn={onDelete} />
                      </>
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
                      setState={(value) => setStatus(value as FormStatus)}
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

                  <FormField
                    control={form.control}
                    name="author_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Author
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Select an author" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {authors.map((author) => (
                              <SelectItem key={author.id} value={author.id}>
                                {author.username || author.email || author.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 border rounded-md p-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Feature this article</FormLabel>
                          <FormDescription>
                            The featured article will be displayed on home page
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
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
            </div>

            {/* Right Column */}
            <div className="space-y-4">
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

              {/* USED MEDIA */}
              <UsedMediaCard 
                articleId={defaultValues.id}
                onMediaRemoved={() => {
                  // Refresh can be added here if needed
                }}
              />

              {/* COVER IMAGE */}
              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem className="border p-2 rounded-md">
                        <FormLabel className="font-semibold ml-2">
                          Cover Image
                        </FormLabel>
                        <FormDescription className="ml-2">
                          1200 x 630
                        </FormDescription>
                        <FormControl>
                          <ImageUpload
                            disabled={loading}
                            value={field.value ? [field.value] : []}
                            onChange={(url: string) => field.onChange(url)}
                            onRemove={() => field.onChange('')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Full Width Content Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Editor 
                  content={content} 
                  onChange={setContent}
                  articleId={defaultValues.id}
                />
              </CardContent>
            </Card>
          </fieldset>
        </form>
      </Form>
    </div>
  );
};

export default ArticleForm;
