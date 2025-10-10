import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { Plugin, PluginKey, NodeSelection } from '@tiptap/pm/state';
// Generate UUID using native crypto API
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const REFNUM_ATTR = 'data-reference-number';
const REF_CLASS = 'footnote-ref footnote-ref-v2';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnoteReferenceV2: {
      /**
       * Add a new footnote reference
       * @example editor.commands.addFootnoteV2()
       */
      addFootnoteV2: () => ReturnType;
    };
    footnoteV2: {
      /**
       * Focus a footnote by its data-id
       * @example editor.commands.focusFootnoteV2('uuid-string')
       */
      focusFootnoteV2: (id: string) => ReturnType;
    };
  }
}

export const FootnoteReferenceV2Extension = Node.create({
  name: 'footnoteReferenceV2',
  
  inline: true,
  content: 'text*',
  group: 'inline',
  atom: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'sup',
        priority: 1000,
        getAttrs(node) {
          const anchor = (node as HTMLElement).querySelector(
            `a.${REF_CLASS.split(' ')[0]}:first-child`
          );
          if (!anchor) {
            return false;
          }
          const id = anchor.getAttribute('data-id');
          const ref = anchor.getAttribute(REFNUM_ATTR);
          return {
            'data-id': id ?? generateUUID(),
            referenceNumber: ref ?? anchor.textContent,
          };
        },
        contentElement(node) {
          return (node as HTMLElement).firstChild as HTMLElement;
        },
      },
    ];
  },

  addAttributes() {
    return {
      class: {
        default: REF_CLASS,
      },
      'data-id': {
        renderHTML(attributes) {
          return {
            'data-id': attributes['data-id'] || generateUUID(),
          };
        },
      },
      referenceNumber: {},
      href: {
        renderHTML(attributes) {
          return {
            href: `#fn:${attributes['referenceNumber']}`,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { referenceNumber, ...attributes } = HTMLAttributes;
    const attrs = mergeAttributes(this.options.HTMLAttributes, attributes);
    attrs[REFNUM_ATTR] = referenceNumber;
    
    return [
      'sup',
      { id: `fnref:${referenceNumber}` },
      ['a', attrs, HTMLAttributes.referenceNumber],
    ];
  },

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        key: new PluginKey('footnoteRefV2Click'),
        props: {
          // On double-click, focus on the footnote
          handleDoubleClickOn(view, pos, node, nodePos, event) {
            if (node.type.name !== 'footnoteReferenceV2') return false;
            event.preventDefault();
            const id = node.attrs['data-id'];
            return editor.commands.focusFootnoteV2(id);
          },
          // Click the footnote reference once to get focus, click twice to scroll to the footnote
          handleClickOn(view, pos, node, nodePos, event) {
            if (node.type.name !== 'footnoteReferenceV2') return false;
            event.preventDefault();
            const { selection } = editor.state.tr;
            if (selection instanceof NodeSelection && selection.node.eq(node)) {
              const id = node.attrs['data-id'];
              return editor.commands.focusFootnoteV2(id);
            } else {
              editor.chain().setNodeSelection(nodePos).run();
              return true;
            }
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      addFootnoteV2:
        () =>
        ({ state, tr }) => {
          const node = this.type.create({
            'data-id': generateUUID(),
          });
          tr.insert(state.selection.anchor, node);
          return true;
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\[\^(.*?)\]$/,
        type: this.type,
        getAttributes: (match) => ({
          'data-id': generateUUID(),
        }),
      }),
    ];
  },
});