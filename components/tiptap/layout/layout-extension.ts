import { Node } from '@tiptap/core';

// Layout Extension
export const LayoutExtension = Node.create({
  name: 'layout',
  group: 'block',
  content: 'layoutColumn+',
  defining: true,

  addAttributes() {
    return {
      layoutType: {
        default: '1-1', // '1-1', '2-1', or '1-2'
        parseHTML: (element) =>
          element.getAttribute('data-layout-type') || '1-1',
        renderHTML: (attributes) => ({
          'data-layout-type': attributes.layoutType,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="layout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    // Map layoutType to Tailwind class
    const layoutType = node.attrs.layoutType || '1-1';
    let gridClass = '';
    if (layoutType === '1-1') gridClass = 'md:grid-cols-[1fr_1fr]';
    if (layoutType === '2-1') gridClass = 'md:grid-cols-[2fr_1fr]';
    if (layoutType === '1-2') gridClass = 'md:grid-cols-[1fr_2fr]';

    return [
      'div',
      {
        ...HTMLAttributes,
        'data-type': 'layout',
        class: `grid gap-4 divide-y md:divide-y-0 md:divide-x grid-cols-1 ${gridClass}`,
      },
      0,
    ];
  },
});

export const LayoutColumnExtension = Node.create({
  name: 'layoutColumn',
  group: 'block',
  content: 'block+',
  defining: true,

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
        class: '',
      },
      0,
    ];
  },
});
