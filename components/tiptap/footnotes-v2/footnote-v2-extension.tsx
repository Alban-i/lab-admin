import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FootnoteV2NodeView } from './footnote-v2-node-view';

export interface FootnoteV2Options {
  HTMLAttributes: Record<string, unknown>;
}

export const FootnoteV2Extension = Node.create<FootnoteV2Options>({
  name: 'footnoteV2',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'block+',

  isolating: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return {
            'data-footnote-id': attributes.id,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'li[data-type="footnote-v2"]',
        getAttrs: element => ({
          id: (element as HTMLElement).getAttribute('data-footnote-id'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'li',
      {
        ...HTMLAttributes,
        'data-type': 'footnote-v2',
        'data-footnote-id': node.attrs.id,
        class: 'footnote-v2',
      },
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteV2NodeView);
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Backspace': ({ editor }) => {
        const { selection, doc } = editor.state;
        const { $from } = selection;

        // Check if we're in an empty footnote
        if ($from.parent.type.name === 'footnoteV2' && $from.parent.content.size === 0) {
          // Find and remove corresponding footnote reference
          const footnoteId = $from.parent.attrs.id;
          if (footnoteId) {
            doc.descendants((node, pos) => {
              if (
                node.type.name === 'footnoteReferenceV2' &&
                node.attrs.footnoteId === footnoteId
              ) {
                editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
                return false;
              }
              return true;
            });
          }

          // Delete the footnote
          return editor.commands.deleteNode('footnoteV2');
        }

        return false;
      },
    };
  },
});