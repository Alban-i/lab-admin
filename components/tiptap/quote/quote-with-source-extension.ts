import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import QuoteWithSourceNodeView from './quote-with-source-node-view';

export interface QuoteWithSourceOptions {
  HTMLAttributes: Record<string, string>;
}

export interface QuoteWithSourceAttrs {
  sourceLabel?: string;
  sourceUrl?: string;
}

/**
 * Custom block‑quote that stores a source label & URL.
 *
 * Key points compared to the previous version:
 *  • `priority: 1000`  → defeats StarterKit's default blockquote (priority 100).
 *  • `parseHTML` only matches <blockquote> that carry *one* of our data‑attrs, so
 *    normal blockquotes still fall back to StarterKit.
 *  • `draggable: true` and `selectable: false` keep the node movable via the
 *    handle but editable inside.
 */
const QuoteWithSourceExtension = Node.create<
  QuoteWithSourceOptions,
  QuoteWithSourceAttrs
>({
  name: 'quoteWithSource',
  priority: 1000, // make sure we win over StarterKit's blockquote
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,
  selectable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      sourceLabel: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-source-label') || '',
        renderHTML: (attrs) =>
          attrs.sourceLabel ? { 'data-source-label': attrs.sourceLabel } : {},
      },
      sourceUrl: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-source-url') || '',
        renderHTML: (attrs) =>
          attrs.sourceUrl ? { 'data-source-url': attrs.sourceUrl } : {},
      },
      direction: {
        default: 'ltr',
        parseHTML: (element) => element.getAttribute('data-direction') || 'ltr',
        renderHTML: (attrs) =>
          attrs.direction && attrs.direction !== 'ltr'
            ? { 'data-direction': attrs.direction }
            : attrs.direction === 'ltr'
            ? { 'data-direction': 'ltr' }
            : {},
      },
      quoteType: {
        default: 'quote-with-source',
        parseHTML: () => 'quote-with-source',
        renderHTML: () => ({ 'data-quote-type': 'quote-with-source' }),
      },
    };
  },

  /** Only accept blockquotes that actually contain our attributes */
  parseHTML() {
    return [{ tag: 'blockquote[data-quote-type="quote-with-source"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'blockquote',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-quote-type': 'quote-with-source',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuoteWithSourceNodeView);
  },
});

export default QuoteWithSourceExtension;
