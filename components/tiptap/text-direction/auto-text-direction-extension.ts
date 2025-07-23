import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface AutoTextDirectionOptions {
  types: string[];
}

const RTL_RANGES = [
  [0x0590, 0x05FF], // Hebrew
  [0x0600, 0x06FF], // Arabic
  [0x0700, 0x074F], // Syriac
  [0x0780, 0x07BF], // Thaana
  [0x08A0, 0x08FF], // Arabic Extended-A
  [0xFB1D, 0xFDFF], // Arabic Presentation Forms-A
  [0xFE70, 0xFEFF], // Arabic Presentation Forms-B
];

function isRTL(char: string): boolean {
  const code = char.charCodeAt(0);
  return RTL_RANGES.some(([start, end]) => code >= start && code <= end);
}

function hasStrongRTLContent(text: string): boolean {
  const trimmedText = text.trim();
  if (!trimmedText) return false;
  
  // Count RTL characters - only consider it strong RTL if there's substantial RTL content
  let rtlCount = 0;
  let totalChars = 0;
  
  for (const char of trimmedText) {
    if (isRTL(char)) {
      rtlCount++;
    }
    if (/\S/.test(char)) { // Non-whitespace character
      totalChars++;
    }
  }
  
  // Only consider it strong RTL if RTL characters make up significant portion
  return rtlCount > 0 && (rtlCount / Math.max(totalChars, 1)) > 0.3;
}

export const AutoTextDirectionExtension = Extension.create<AutoTextDirectionOptions>({
  name: 'autoTextDirection',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          dir: {
            default: null,
            renderHTML: (attributes) => {
              if (!attributes.dir) {
                return {};
              }
              return {
                dir: attributes.dir,
              };
            },
            parseHTML: (element) => {
              return element.getAttribute('dir');
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autoTextDirection'),
        
        appendTransaction: (transactions, oldState, newState) => {
          // Only process if there were actual content changes
          const hasContentChanges = transactions.some(tr => tr.docChanged);
          if (!hasContentChanges) return null;

          const tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentDir = node.attrs.dir;
              const nodeText = node.textContent.trim();
              
              // Remove dir from empty nodes
              if (!nodeText) {
                if (currentDir) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    dir: null,
                  });
                  modified = true;
                }
                return;
              }
              
              // Auto-detect direction based on content
              let shouldHaveDir: 'rtl' | null = null;
              
              // Only add dir="rtl" for strong RTL content
              if (hasStrongRTLContent(nodeText)) {
                shouldHaveDir = 'rtl';
              }
              
              if (currentDir !== shouldHaveDir) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  dir: shouldHaveDir,
                });
                modified = true;
              }
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});