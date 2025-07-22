import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FootnoteReferenceV2NodeView } from './footnote-reference-v2-node-view';

export interface FootnoteReferenceV2Options {
  HTMLAttributes: Record<string, unknown>;
}

export const FootnoteReferenceV2Extension = Node.create<FootnoteReferenceV2Options>({
  name: 'footnoteReferenceV2',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      footnoteId: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-id'),
        renderHTML: attributes => {
          if (!attributes.footnoteId) {
            return {};
          }
          return {
            'data-footnote-id': attributes.footnoteId,
          };
        },
      },
      referenceNumber: {
        default: '1',
        parseHTML: element => element.getAttribute('data-reference-number'),
        renderHTML: attributes => {
          return {
            'data-reference-number': attributes.referenceNumber || '1',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="footnote-reference-v2"]',
        getAttrs: element => ({
          footnoteId: (element as HTMLElement).getAttribute('data-footnote-id'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      {
        ...HTMLAttributes,
        'data-type': 'footnote-reference-v2',
        'data-footnote-id': node.attrs.footnoteId,
        'data-reference-number': node.attrs.referenceNumber,
        class: 'footnote-reference-v2',
      },
      node.attrs.referenceNumber || '1',
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteReferenceV2NodeView);
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Backspace': ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;

        // Check if cursor is right after a footnote reference
        const nodeBefore = $from.nodeBefore;
        if (nodeBefore && nodeBefore.type.name === 'footnoteReferenceV2') {
          const footnoteId = nodeBefore.attrs.footnoteId;
          
          // Find and delete corresponding footnote
          if (footnoteId) {
            const { doc } = editor.state;
            doc.descendants((node, pos) => {
              if (
                node.type.name === 'footnoteV2' &&
                node.attrs.id === footnoteId
              ) {
                editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
                return false;
              }
              return true;
            });
          }

          // Delete the reference itself
          return editor.commands.deleteRange({
            from: $from.pos - nodeBefore.nodeSize,
            to: $from.pos,
          });
        }

        return false;
      },
    };
  },
});