import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import QuoteNodeView from './quote-node-view';

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
const QuoteWithSource = Node.create<
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
      quoteType: {
        default: 'regular', // can be 'regular', 'hadith', or 'quran'
        parseHTML: (element) =>
          element.getAttribute('data-quote-type') || 'regular',
        renderHTML: (attrs) =>
          attrs.quoteType && attrs.quoteType !== 'regular'
            ? { 'data-quote-type': attrs.quoteType }
            : {},
      },
    };
  },

  /** Only accept blockquotes that actually contain our attributes */
  parseHTML() {
    return [
      { tag: 'blockquote[data-source-label]' },
      { tag: 'blockquote[data-source-url]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'blockquote',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuoteNodeView);
  },
});

export default QuoteWithSource;
