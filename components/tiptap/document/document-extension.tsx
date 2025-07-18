import { Node, mergeAttributes, CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import DocumentNodeView from './document-node-view';

export interface DocumentOptions {
  inline: boolean;
  HTMLAttributes: Record<string, string | number | boolean>;
}

export const CustomDocumentExtension = Node.create<DocumentOptions>({
  name: 'customDocument',
  group: 'block',
  inline: false,
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
      fileType: { default: null },
      fileSize: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-custom-document]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-custom-document': true,
        'data-src': node.attrs.src,
        'data-title': node.attrs.title,
        'data-file-type': node.attrs.fileType,
        'data-file-size': node.attrs.fileSize,
      }),
      [
        'a',
        {
          href: node.attrs.src,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        node.attrs.title || 'Download Document',
      ],
    ];
  },

  addCommands() {
    return {
      setDocument:
        (options: { src?: string; title?: string; fileType?: string; fileSize?: string }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      deleteDocument:
        () =>
        ({ commands }: CommandProps) => {
          return commands.deleteSelection();
        },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  },

  addNodeView() {
    return ReactNodeViewRenderer(DocumentNodeView);
  },
});