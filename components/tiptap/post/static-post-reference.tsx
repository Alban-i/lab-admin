import { mergeAttributes, Node } from '@tiptap/core';
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps,
} from '@tiptap/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

interface PostReferenceAttributes {
  postId: string;
  title: string;
  content: string;
  imageUrl: string | null;
}

const PostReferenceComponent = ({
  node,
  selected,
  deleteNode,
}: NodeViewProps) => {
  const { postId, title, content, imageUrl } =
    node.attrs as PostReferenceAttributes;

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
          className="ring-offset-2 ring-ring data-[active=true]:ring-2"
        >
          {imageUrl && (
            <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </CardContent>
        </Card>
      </div>
    </NodeViewWrapper>
  );
};

export const PostReference = Node.create({
  name: 'postReference',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      postId: {
        default: null,
      },
      title: {
        default: '',
      },
      content: {
        default: '',
      },
      imageUrl: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="post-reference"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'post-reference' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PostReferenceComponent);
  },
});

export default PostReference;
