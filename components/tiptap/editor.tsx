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
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Footnote, FootnoteReference, Footnotes } from 'tiptap-footnotes';
import { TextDirection } from 'tiptap-text-direction';
import QuoteWithSourceExtension from './quote/quote-with-source-extension';

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
  Music,
  Quote,
  Rows,
  Split,
  Table as TableIcon,
  Trash2,
} from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useCallback, useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { CustomAudioExtension } from './audio/custom-audio-extension';
import CustomImageExtension from './image/custom-image-extension';
import { CustomVideoExtension } from './video/video-extension';
import { CustomDocumentExtension } from './document/document-extension';
// import { PostReference } from './post/static-post-reference';
// import { PostSelector } from './post/static-post-selector-dialog';
import { DynamicPostReference } from './post/dynamic-post-reference';
import { DynamicPostSelectorDialog } from './post/dynamic-post-selector-dialog';
import QuoteWithTranslationExtension from './quote/quote-with-translation-extension';
import {
  LayoutColumnExtension,
  LayoutExtension,
} from './layout/layout-extension';
import { MediaLibraryModal } from '../media/media-library-modal';
import { MediaWithProfile } from '@/actions/media/get-media';

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

export default function Editor({ content = '', onChange }: EditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);



  const editor = useEditor({
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
      CustomImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      CustomAudioExtension,
      CustomVideoExtension,
      CustomDocumentExtension,
      CharacterCount,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader.extend({
        content: 'paragraph',
      }),
      TableCell.extend({
        content: 'paragraph',
      }),
      TextDirection.configure({
        types: ['paragraph', 'heading'],
        defaultDirection: 'ltr',
      }),
      Placeholder.configure({
        placeholder: '',
      }),
      LayoutExtension,
      LayoutColumnExtension,
      Footnotes,
      Footnote,
      FootnoteReference,
      // PostReference,
      DynamicPostReference,
      QuoteWithSourceExtension,
      QuoteWithTranslationExtension,
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
      handleKeyDown: (_view, event) => {
        if (event.key === 'Alt' && event.shiftKey) {
          const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
          setDirection(newDirection);
          editor?.commands.setTextDirection(newDirection);
          return true;
        }
        return false;
      },
      handleDrop: (view: EditorView, event: DragEvent, _slice, _moved) => {
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
          } else if (sourceNode.type.name === 'video') {
            tr.insert(
              coordinates.pos,
              view.state.schema.nodes.video.create(sourceNodeData.attrs)
            );
          } else if (sourceNode.type.name === 'customDocument') {
            tr.insert(
              coordinates.pos,
              view.state.schema.nodes.customDocument.create(
                sourceNodeData.attrs
              )
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
          // attrs: { width: '50%' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: ' ' }],
            },
          ],
        },
        {
          type: 'layoutColumn',
          // attrs: { width: '50%' },
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

  const handleMediaSelect = useCallback(
    (media: MediaWithProfile) => {
      if (!editor) return;

      // Insert different types of media based on their type
      switch (media.media_type) {
        case 'audio':
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor.chain().focus() as any).setAudio({
            src: media.url,
            title: media.original_name,
          }).run();
          break;
        case 'image':
          editor
            .chain()
            .focus()
            .setImage({
              src: media.url,
              alt: media.alt_text || media.original_name,
              title: media.original_name,
            })
            .run();
          break;
        case 'video':
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor.chain().focus() as any).setVideo({
            src: media.url,
            title: media.original_name,
          }).run();
          break;
        case 'document':
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor.chain().focus() as any).setDocument({
            src: media.url,
            title: media.original_name,
            fileType: media.original_name?.split('.').pop()?.toUpperCase(),
          }).run();
          break;
      }
    },
    [editor]
  );

  if (!editor || !isMounted) {
    return null;
  }

  return (
    <div className="w-full">
      {/* MENU BAR */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
        {/* GROUP 1: HTML STYLING & FORMATTING */}
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (!editor) return;
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'quoteWithSource',
                attrs: { sourceLabel: '', sourceUrl: '' },
                content: [
                  {
                    type: 'paragraph',
                    // content: [{ type: 'text', text: 'Type your quote...' }],
                  },
                ],
              })
              .run();
            editor.commands.focus();
          }}
          title="Quote with Source"
        >
          <Quote className="h-4 w-4 mr-2" />
          Quote + Source
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (!editor) return;
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'quoteWithTranslation',
                attrs: {
                  original: '',
                  translation: '',
                  sourceLabel: '',
                  sourceUrl: '',
                  autoOpen: true,
                },
              })
              .run();
            editor.commands.focus();
          }}
          title="Quote with Translation"
        >
          <span className="h-4 w-4 mr-2 font-bold">Q</span>
          Quote + Translation
        </Button>
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

        {/* SEPARATOR 1 */}
        <Separator className="h-6" />

        {/* GROUP 2: MEDIA MANAGEMENT */}
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
                Image (Cloud)
              </Button>
            );
          }}
        </CldUploadWidget>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsMediaLibraryOpen(true)}
        >
          <Music className="h-4 w-4 mr-2" />
          Media
        </Button>

        {/* SEPARATOR 2 */}
        <Separator className="h-6" />

        {/* GROUP 3: POST REFERENCES */}
        <DynamicPostSelectorDialog
          onSelect={(postId) => {
            if (editor) {
              editor
                .chain()
                .focus()
                .insertContent({
                  type: 'dynamicPostReference',
                  attrs: {
                    postId,
                  },
                })
                .run();
            }
          }}
        />
      </div>

      {/* ERROR MESSAGE */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{uploadError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* EDITOR CONTENT */}
      <EditorContent
        editor={editor}
        className="border rounded-lg p-4 bg-card w-full tiptap [&_.footnotes]:mt-8 [&_.footnotes]:pt-8 [&_.footnotes]:border-t [&_.footnotes]:border-border [&_.footnotes]:list-decimal [&_.footnote-reference]:text-primary [&_.footnote-reference]:align-super [&_.footnote-reference]:text-xs [&_.footnote-reference]:cursor-pointer [&_.footnote-reference]:ml-0.5"
      />
      <div className="mt-2 text-sm text-muted-foreground">
        {editor.storage.characterCount.characters()} characters
      </div>
      {/* <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Raw HTML</h3>
        <pre className="bg-muted p-4 rounded-lg border text-sm font-mono overflow-x-auto shadow-md">
          <code className="whitespace-pre-wrap">
            {editor.getHTML().replace(/></g, '>\n<')}
          </code>
        </pre>
      </div> */}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleMediaSelect}
        title="Select Media"
      />

    </div>
  );
}
