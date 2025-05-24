import { mergeAttributes, Node } from '@tiptap/core';
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps,
} from '@tiptap/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/providers/supabase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
}

interface DynamicPostReferenceAttributes {
  postId: string;
}

const DynamicPostReferenceComponent = ({
  node,
  selected,
  deleteNode,
}: NodeViewProps) => {
  const { postId } = node.attrs as DynamicPostReferenceAttributes;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, image_url')
        .eq('id', parseInt(postId, 10))
        .single();

      if (error) {
        setError('Failed to load post');
        setLoading(false);
        return;
      }

      if (data) {
        setPost({
          ...data,
          id: data.id.toString(),
        });
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <NodeViewWrapper>
        <div className="not-prose my-4">
          <Card>
            <div className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%] mt-2" />
              </CardContent>
            </div>
          </Card>
        </div>
      </NodeViewWrapper>
    );
  }

  if (error || !post) {
    return (
      <NodeViewWrapper>
        <div className="not-prose my-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                Error Loading Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || 'Post not found'}</p>
            </CardContent>
          </Card>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div
        data-drag-handle
        className="not-prose my-4 cursor-move relative group"
        draggable="true"
        data-post-id={postId}
      >
        {selected && (
          <div
            className="absolute top-2 right-2 flex gap-2 bg-background/50 p-2 rounded z-10"
            contentEditable={false}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              className="p-1 hover:bg-muted rounded cursor-pointer"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4 text-foreground" />
            </button>
          </div>
        )}
        <Card
          data-active={selected}
          className="pt-0 ring-offset-2 ring-ring data-[active=true]:ring-2"
        >
          {post.image_url && (
            <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </CardContent>
        </Card>
      </div>
    </NodeViewWrapper>
  );
};

export const DynamicPostReference = Node.create({
  name: 'dynamicPostReference',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      postId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dynamic-post-reference"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'dynamic-post-reference',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DynamicPostReferenceComponent);
  },
});
