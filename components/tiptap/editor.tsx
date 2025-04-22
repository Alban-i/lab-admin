'use client';

import CharacterCount from '@tiptap/extension-character-count';
import Document from '@tiptap/extension-document';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Typography from '@tiptap/extension-typography';
import { EditorView } from '@tiptap/pm/view';
import { EditorContent, Node, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Footnote, FootnoteReference, Footnotes } from 'tiptap-footnotes';
import { TextDirection } from 'tiptap-text-direction';

import { Button } from '@/components/ui/button';
import {
  AlignLeft,
  AlignRight,
  Asterisk,
  Bold,
  Code,
  Columns,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Layout,
  Link as LinkIcon,
  List,
  ListOrdered,
  Merge,
  Quote,
  Rows,
  Split,
  Table as TableIcon,
  Trash2,
} from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toggle } from '@/components/ui/toggle';
import { createClient } from '@/providers/supabase/client';
import { CustomAudio } from './custom-audio';
import CustomImage from './custom-image';
import { PostReference } from './post-reference';
import { PostSelector } from './post-selector-dialog';

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

export default function Editor({ content = '', onChange }: EditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  // inside Editor()
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const supabase = createClient();
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const fileName = `${Date.now()}_${file.name}`;
    // upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audios')
      .upload(fileName, file);
    if (error) {
      console.error(error);
      return;
    }
    // get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('audios').getPublicUrl(fileName);
    // insert into editor
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'audio',
        attrs: { src: publicUrl, title: file.name },
      })
      .run();
  };

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
      CustomAudio,
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
      PostReference,
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

          console.log('Source node type:', sourceNode.type.name);
          console.log(
            'Available node types:',
            Object.keys(view.state.schema.nodes)
          );

          // Delete old node and insert new one at drop position
          tr.delete(sourcePosition, sourcePosition + sourceNode.nodeSize);

          // Check node type and insert appropriate node
          if (sourceNode.type.name === 'customImage') {
            tr.insert(
              coordinates.pos,
              view.state.schema.nodes.customImage.create(sourceNodeData.attrs)
            );
          } else if (sourceNode.type.name === 'audio') {
            tr.insert(
              coordinates.pos,
              view.state.schema.nodes.audio.create(sourceNodeData.attrs)
            );
          }

          view.dispatch(tr);
          return true;
        } catch (error) {
          console.error('Error handling node drop:', error);
          return false;
        }
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onImageUpload = useCallback(
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
      {/* MENU BAR */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
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
        <CldUploadWidget onSuccess={onImageUpload} uploadPreset="markazshaafii">
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
        <input
          type="file"
          accept="audio/*"
          ref={audioInputRef}
          onChange={handleAudioUpload}
          style={{ display: 'none' }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => audioInputRef.current?.click()}
        >
          Audio
        </Button>
        <PostSelector
          onSelect={(post) => {
            if (editor) {
              editor
                .chain()
                .focus()
                .insertContent({
                  type: 'postReference',
                  attrs: {
                    postId: post.id,
                    title: post.title,
                    content: post.content,
                    imageUrl: post.image_url,
                  },
                })
                .run();
            }
          }}
        />
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
              className="text-destructive focus:text-destructive"
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

      {/* EDITOR CONTENT */}
      <EditorContent
        editor={editor}
        className="border rounded-lg p-4 bg-card w-full tiptap [&_.footnotes]:mt-8 [&_.footnotes]:pt-8 [&_.footnotes]:border-t [&_.footnotes]:border-border [&_.footnotes]:list-decimal [&_.footnote-reference]:text-primary [&_.footnote-reference]:align-super [&_.footnote-reference]:text-xs [&_.footnote-reference]:cursor-pointer [&_.footnote-reference]:ml-0.5"
      />
      <div className="mt-2 text-sm text-muted-foreground">
        {editor.storage.characterCount.characters()} characters
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Raw HTML</h3>
        <pre className="bg-muted p-4 rounded-lg border text-sm font-mono overflow-x-auto shadow-md">
          <code className="whitespace-pre-wrap">
            {editor.getHTML().replace(/></g, '>\n<')}
          </code>
        </pre>
      </div>
    </div>
  );
}
