// Custom Image Extension
import { Image } from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { mergeAttributes, CommandProps } from '@tiptap/core';
import ImageNodeView from './image-node-view';

const CustomImageExtension = Image.extend({
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
        parseHTML: (element) => {
          // Try to get from the parent <figure> if available
          if (
            element.parentElement &&
            element.parentElement.tagName === 'FIGURE'
          ) {
            return (
              element.parentElement.getAttribute('data-alignment') || 'center'
            );
          }
          // fallback: try to get from the element itself
          return element.getAttribute('data-alignment') || 'center';
        },
      },
      legend: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.legend) return {};
          return { 'data-legend': attributes.legend };
        },
        parseHTML: (element) => element.getAttribute('data-legend') || null,
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

    const imgAttrs = mergeAttributes(HTMLAttributes, {
      src,
      alt,
      title,
      width,
      height,
      class: 'rounded-lg shadow-md',
      style: `display: block; margin: ${margin}; max-width: 100%; height: auto;`,
      'data-alignment': alignment || 'center',
    });

    return ['img', imgAttrs];
  },
});

export default CustomImageExtension;
