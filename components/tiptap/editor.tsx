'use client';

import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import {
  EditorContent,
  useEditor,
  Node,
  NodeViewWrapper,
  NodeViewContent,
  NodeViewProps,
  Editor as TiptapEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { mergeAttributes, nodeInputRule, CommandProps } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { TextDirection } from 'tiptap-text-direction';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EditorView } from '@tiptap/pm/view';
import { Footnotes, FootnoteReference, Footnote } from 'tiptap-footnotes';
import Document from '@tiptap/extension-document';

import { CldUploadWidget } from 'next-cloudinary';
import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ImagePlus,
  Quote,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Columns,
  Rows,
  Merge,
  Split,
  Trash2,
  Plus,
  AlignLeft,
  AlignRight,
  Layout,
  Asterisk,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Toggle } from '@/components/ui/toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

interface UploadResult {
  info?:
    | {
        secure_url: string;
      }
    | string;
}

interface HTMLAttributes {
  [key: string]: string | number | boolean | undefined;
}

interface ImageNodeViewProps extends NodeViewProps {
  updateAttributes: (attrs: {
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
    alignment?: string;
  }) => void;
  deleteNode: () => void;
  selected: boolean;
  getPos: () => number;
  editor: TiptapEditor;
}

// Layout Extension
const LayoutExtension = Node.create({
  name: 'layout',
  group: 'block',
  content: 'layoutColumn+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="layout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        ...HTMLAttributes,
        'data-type': 'layout',
        class: 'flex flex-wrap gap-4',
      },
      0,
    ];
  },
});

const LayoutColumn = Node.create({
  name: 'layoutColumn',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      width: {
        default: '50%',
        parseHTML: (element) => element.getAttribute('data-width'),
        renderHTML: (attributes) => {
          return {
            'data-width': attributes.width,
            style: `width: ${attributes.width}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="layoutColumn"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        ...HTMLAttributes,
        'data-type': 'layoutColumn',
        class: 'flex-1 min-w-[200px]',
      },
      0,
    ];
  },
});

const ImageNodeView = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  getPos,
  editor,
}: ImageNodeViewProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    setIsResizing(true);
    setInitialSize({
      width: rect.width,
      height: rect.height,
    });
    setInitialMousePos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !imageRef.current) return;

      const deltaX = e.clientX - initialMousePos.x;
      const deltaY = e.clientY - initialMousePos.y;
      const aspectRatio = initialSize.height / initialSize.width;

      const newWidth = Math.max(100, initialSize.width + deltaX);
      const newHeight = Math.round(newWidth * aspectRatio);

      updateAttributes({
        width: newWidth,
        height: newHeight,
      });
    },
    [isResizing, initialMousePos, initialSize, updateAttributes]
  );

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopResize);
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, handleResize, stopResize]);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    // Store the current position and node data in the dataTransfer
    const nodeData = {
      pos: getPos(),
      node: {
        ...node.toJSON(),
        attrs: {
          ...node.attrs,
          width: node.attrs.width,
          height: node.attrs.height,
          alignment: node.attrs.alignment,
        },
      },
    };
    e.dataTransfer.setData('application/json', JSON.stringify(nodeData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <NodeViewWrapper className="relative">
      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          margin:
            node.attrs.alignment === 'left'
              ? '0 auto 0 0'
              : node.attrs.alignment === 'right'
              ? '0 0 0 auto'
              : '0 auto',
          display: 'block',
          maxWidth: '100%',
          width: node.attrs.width || 'auto',
          height: node.attrs.height || 'auto',
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
        }}
        className="rounded-lg shadow-md"
      />
      {selected && (
        <>
          <div
            className="absolute top-2 left-2 flex gap-2 bg-black/50 p-2 rounded"
            contentEditable={false}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                updateAttributes({ alignment: 'left' });
              }}
              className="p-1 text-white hover:bg-black/20 rounded cursor-pointer"
              title="Align left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                updateAttributes({ alignment: 'center' });
              }}
              className="p-1 text-white hover:bg-black/20 rounded cursor-pointer"
              title="Center"
            >
              <AlignLeft className="h-4 w-4 rotate-90" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                updateAttributes({ alignment: 'right' });
              }}
              className="p-1 text-white hover:bg-black/20 rounded cursor-pointer"
              title="Align right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
          </div>
          <div
            className="absolute top-2 right-2 flex gap-2 bg-black/50 p-2 rounded"
            contentEditable={false}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const newAlt = window.prompt('Enter alt text:', node.attrs.alt);
                if (newAlt !== null) {
                  updateAttributes({ alt: newAlt });
                }
              }}
              className="p-1 text-white text-xs font-semibold hover:bg-black/20 rounded cursor-pointer"
              title="Edit alt text"
            >
              Alt
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              className="p-1 hover:bg-black/20 rounded cursor-pointer"
              title="Delete image"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          </div>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-black/50 cursor-se-resize"
            contentEditable={false}
            draggable={false}
            onMouseDown={startResize}
            title="Resize image"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full text-white p-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 3L14 10M21 7V3H17M10 14L3 21M7 21H3V17" />
            </svg>
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
};

// Custom Image Extension
const CustomImage = Image.extend({
  name: 'customImage',

  addOptions() {
    return {
      ...this.parent?.(),
    };
  },

  addAttributes() {
    const parentAttributes = this.parent?.() || {};

    return {
      ...parentAttributes,
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      alt: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.alt) return {};
          return { alt: attributes.alt };
        },
      },
      title: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { title: attributes.title };
        },
      },
      alignment: {
        default: 'center',
        renderHTML: (attributes) => {
          const margin =
            attributes.alignment === 'left'
              ? '0 auto 0 0'
              : attributes.alignment === 'right'
              ? '0 0 0 auto'
              : '0 auto';

          return {
            style: `display: block; margin: ${margin}`,
          };
        },
      },
    };
  },

  addCommands() {
    const parentCommands = this.parent?.() || {};

    return {
      ...parentCommands,
      setImage:
        (options) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      deleteImage:
        () =>
        ({ commands }: CommandProps) => {
          return commands.deleteSelection();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, title, width, height, alignment } = node.attrs;
    const margin =
      alignment === 'left'
        ? '0 auto 0 0'
        : alignment === 'right'
        ? '0 0 0 auto'
        : '0 auto';

    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        src,
        alt,
        title,
        width,
        height,
        class: 'rounded-lg shadow-md',
        style: `display: block; margin: ${margin}; max-width: 100%; height: auto;`,
      }),
    ];
  },
});

export default function Editor({ content = '', onChange }: EditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Document.extend({
        content: 'block+ footnotes?',
      }),
      Highlight,
      Typography,
      Link,
      CustomImage.configure({
        inline: true,
        allowBase64: true,
      }),
      CharacterCount,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextDirection.configure({
        types: ['paragraph', 'heading'],
        defaultDirection: 'ltr',
      }),
      Placeholder.configure({
        placeholder: '',
      }),
      LayoutExtension,
      LayoutColumn,
      Footnotes,
      Footnote,
      FootnoteReference,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] w-full',
        dir: direction,
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Alt' && event.shiftKey) {
          const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
          setDirection(newDirection);
          editor?.commands.setTextDirection(newDirection);
          return true;
        }
        return false;
      },
      handleDrop: (view: EditorView, event: DragEvent, slice, moved) => {
        try {
          const jsonData = event.dataTransfer?.getData('application/json');
          if (!jsonData) return false;

          event.preventDefault();

          const { pos: sourcePos, node: sourceNodeData } = JSON.parse(jsonData);

          // Get coordinates relative to the editor view
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (!coordinates) return false;

          const tr = view.state.tr;

          // Delete the node from its original position
          const sourcePosition = parseInt(sourcePos);
          const sourceNode = view.state.doc.nodeAt(sourcePosition);

          if (!sourceNode) return false;

          // Delete old node and insert new one
          tr.delete(sourcePosition, sourcePosition + sourceNode.nodeSize);
          tr.insert(
            coordinates.pos,
            view.state.schema.nodes.customImage.create(sourceNodeData.attrs)
          );

          view.dispatch(tr);
          return true;
        } catch (error) {
          console.error('Error handling image drop:', error);
          return false;
        }
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = useCallback(
    (result: UploadResult) => {
      if (
        editor &&
        typeof result.info === 'object' &&
        result.info?.secure_url
      ) {
        editor
          .chain()
          .focus()
          .setImage({
            src: result.info.secure_url,
            alt: 'Uploaded image',
            title: 'Click to edit image properties',
          })
          .run();
      }
    },
    [editor]
  );

  const toggleDirection = useCallback(() => {
    if (!editor) return;
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    editor.commands.setTextDirection(newDirection);
  }, [editor, direction]);

  const insertLayout = useCallback(() => {
    if (!editor) return;

    const layoutStructure = {
      type: 'layout',
      content: [
        {
          type: 'layoutColumn',
          attrs: { width: '50%' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: ' ' }],
            },
          ],
        },
        {
          type: 'layoutColumn',
          attrs: { width: '50%' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: ' ' }],
            },
          ],
        },
      ],
    };

    editor.chain().focus().insertContent(layoutStructure).run();
  }, [editor]);

  const insertFootnote = useCallback(() => {
    if (!editor) return;

    editor.chain().focus().addFootnote().run();
  }, [editor]);

  if (!editor || !isMounted) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
        <Toggle
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          size="sm"
          variant="outline"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          size="sm"
          variant="outline"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          size="sm"
          variant="outline"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          size="sm"
          variant="outline"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          size="sm"
          variant="outline"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('bulletList')}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          size="sm"
          variant="outline"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('orderedList')}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          size="sm"
          variant="outline"
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('codeBlock')}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          size="sm"
          variant="outline"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('link')}
          onPressedChange={() => {
            const url = window.prompt('URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          size="sm"
          variant="outline"
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('blockquote')}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          size="sm"
          variant="outline"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        <CldUploadWidget onSuccess={onUpload} uploadPreset="markazshaafii">
          {({ open }) => {
            const onClick = () => {
              open();
            };
            return (
              <Button
                type="button"
                variant="outline"
                onClick={onClick}
                size="sm"
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Image
              </Button>
            );
          }}
        </CldUploadWidget>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            insertLayout();
          }}
          title="Insert Layout"
        >
          <Layout className="h-4 w-4 mr-2" />
          Layout
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={insertFootnote}
          title="Insert Footnote"
        >
          <Asterisk className="h-4 w-4 mr-2" />
          Footnote
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <TableIcon className="h-4 w-4 mr-2" />
              Table
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Table Operations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              <TableIcon className="mr-2 h-4 w-4" />
              <span>Insert Table</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              disabled={!editor.can().addColumnBefore()}
            >
              <Columns className="mr-2 h-4 w-4" />
              <span>Add Column Before</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
            >
              <Columns className="mr-2 h-4 w-4 rotate-180" />
              <span>Add Column After</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Column</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Rows</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowBefore().run()}
              disabled={!editor.can().addRowBefore()}
            >
              <Rows className="mr-2 h-4 w-4" />
              <span>Add Row Before</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
            >
              <Rows className="mr-2 h-4 w-4 rotate-180" />
              <span>Add Row After</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Row</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Cells</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!editor.can().mergeCells()}
            >
              <Merge className="mr-2 h-4 w-4" />
              <span>Merge Cells</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!editor.can().splitCell()}
            >
              <Split className="mr-2 h-4 w-4" />
              <span>Split Cell</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Table</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Toggle
          pressed={direction === 'rtl'}
          onPressedChange={toggleDirection}
          size="sm"
          variant="outline"
          title="Toggle Text Direction (Alt+Shift)"
        >
          {direction === 'ltr' ? (
            <AlignLeft className="h-4 w-4" />
          ) : (
            <AlignRight className="h-4 w-4" />
          )}
        </Toggle>
      </div>
      <EditorContent
        editor={editor}
        className="border rounded-lg p-4 bg-white w-full tiptap [&_.footnotes]:mt-8 [&_.footnotes]:pt-8 [&_.footnotes]:border-t [&_.footnotes]:border-gray-200 [&_.footnotes]:list-decimal [&_.footnote-reference]:text-blue-600 [&_.footnote-reference]:align-super [&_.footnote-reference]:text-xs [&_.footnote-reference]:cursor-pointer [&_.footnote-reference]:ml-0.5"
      />
      <div className="mt-2 text-sm text-gray-500">
        {editor.storage.characterCount.characters()} characters
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Raw HTML</h3>
        <pre className="bg-gray-100 p-4 rounded-lg border text-sm font-mono overflow-x-auto shadow-md">
          <code className="whitespace-pre-wrap">
            {editor.getHTML().replace(/></g, '>\n<')}
          </code>
        </pre>
      </div>
    </div>
  );
}
