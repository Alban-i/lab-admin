import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FootnotesV2NodeView } from './footnotes-v2-node-view';
import { FootnoteV2Rules } from './footnote-v2-rules';

export interface FootnotesV2Options {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnotesV2: {
      /**
       * Add a footnote
       */
      addFootnoteV2: () => ReturnType;
    };
  }
}

export const FootnotesV2Extension = Node.create<FootnotesV2Options>({
  name: 'footnotesV2',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'footnoteV2*',

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="footnotes-v2"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        ...HTMLAttributes,
        'data-type': 'footnotes-v2',
        class: 'footnotes-v2',
      },
      ['ol', 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnotesV2NodeView);
  },

  // Temporarily disabled FootnoteV2Rules to fix content persistence issues
  // addExtensions() {
  //   return [FootnoteV2Rules];
  // },

  addCommands() {
    return {
      addFootnoteV2:
        () =>
        ({ commands, state, tr }) => {
          const { doc } = state;
          
          // Generate unique footnote ID
          const footnoteId = `fn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Count existing footnote references to determine the next number
          let referenceCount = 0;
          doc.descendants((node) => {
            if (node.type.name === 'footnoteReferenceV2') {
              referenceCount += 1;
            }
          });
          const nextNumber = referenceCount + 1;
          
          // Check if footnotes container exists
          let footnotesPos = -1;
          doc.descendants((node, pos) => {
            if (node.type.name === 'footnotesV2') {
              footnotesPos = pos;
              return false;
            }
            return true;
          });

          // Create footnote reference with number
          const referenceNode = state.schema.nodes.footnoteReferenceV2.create({
            footnoteId,
            referenceNumber: nextNumber.toString(),
          });

          // Create footnote content
          const emptyParagraph = state.schema.nodes.paragraph.create();
          const footnoteNode = state.schema.nodes.footnoteV2.create(
            { id: footnoteId },
            [emptyParagraph]
          );

          if (footnotesPos === -1) {
            // Create footnotes container if it doesn't exist
            const footnotesContainer = state.schema.nodes.footnotesV2.create(
              {},
              [footnoteNode]
            );
            
            // Insert at end of document
            tr.insert(doc.content.size, footnotesContainer);
          } else {
            // Add to existing container
            const footnotesNode = doc.nodeAt(footnotesPos);
            if (footnotesNode) {
              tr.insert(
                footnotesPos + footnotesNode.nodeSize - 1, 
                footnoteNode
              );
            }
          }

          // Insert footnote reference at current position
          tr.insert(state.selection.anchor, referenceNode);
          
          return true;
        },
    };
  },
});