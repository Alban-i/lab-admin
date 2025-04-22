import { useCallback, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { createClient } from '@/providers/supabase/client';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
}

interface PostSelectorProps {
  onSelect: (post: Post) => void;
}

export function PostSelector({ onSelect }: PostSelectorProps) {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const searchPosts = useCallback(async (searchTerm: string) => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, content, image_url')
      .ilike('title', `%${searchTerm}%`)
      .limit(5);

    if (!error && data) {
      // Convert id to string to match Post interface
      const formattedPosts = data.map((post) => ({
        ...post,
        id: post.id.toString(),
      }));
      setPosts(formattedPosts);
    }
    setLoading(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Reference Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reference a Post</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput
            placeholder="Search posts..."
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              searchPosts(value);
            }}
          />
          <CommandEmpty>
            {loading ? 'Searching...' : 'No posts found.'}
          </CommandEmpty>
          <CommandGroup>
            {posts.map((post) => (
              <CommandItem
                key={post.id}
                value={post.title}
                onSelect={() => {
                  onSelect(post);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    open ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {post.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
