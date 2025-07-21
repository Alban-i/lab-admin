import { Mark } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface GlossaryTermOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    glossaryTerm: {
      setGlossaryTerm: (termId: string, definition: string) => ReturnType;
      toggleGlossaryTerm: (termId: string, definition: string) => ReturnType;
      unsetGlossaryTerm: () => ReturnType;
    };
  }
}

export const GlossaryTermExtension = Mark.create<GlossaryTermOptions>({
  name: 'glossaryTerm',
  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'glossary-term',
        'data-tooltip': true,
      },
    };
  },

  addAttributes() {
    return {
      termId: {
        default: null,
        parseHTML: element => element.getAttribute('data-term-id'),
        renderHTML: attributes => ({
          'data-term-id': attributes.termId,
        }),
      },
      definition: {
        default: null,
        parseHTML: element => element.getAttribute('data-definition'),
        renderHTML: attributes => ({
          'data-definition': attributes.definition,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-term-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setGlossaryTerm:
        (termId: string, definition: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { termId, definition });
        },
      toggleGlossaryTerm:
        (termId: string, definition: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { termId, definition });
        },
      unsetGlossaryTerm:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addProseMirrorPlugins() {
    const createTooltip = (element: HTMLElement, definition: string) => {
      let tooltip: HTMLElement | null = null;
      
      const showTooltip = () => {
        if (tooltip) return;
        
        tooltip = document.createElement('div');
        tooltip.setAttribute('data-glossary-tooltip', 'true');
        tooltip.className = 'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance max-w-sm absolute';
        tooltip.textContent = definition;
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        tooltip.style.left = `${rect.left + scrollLeft + (rect.width / 2)}px`;
        tooltip.style.top = `${rect.top + scrollTop - 35}px`;
        tooltip.style.transform = 'translate(-50%, 0)';
        
        document.body.appendChild(tooltip);
      };
      
      const hideTooltip = () => {
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }
      };
      
      element.addEventListener('mouseenter', showTooltip);
      element.addEventListener('mouseleave', hideTooltip);
      element.addEventListener('focus', showTooltip);
      element.addEventListener('blur', hideTooltip);
    };

    return [
      new Plugin({
        key: new PluginKey('glossaryTooltip'),
        view: () => ({
          update: (view, prevState) => {
            // Clean up existing tooltips
            const existingTooltips = document.querySelectorAll('[data-glossary-tooltip]');
            existingTooltips.forEach((tooltip) => tooltip.remove());

            // Create tooltips for glossary terms
            const glossaryElements = document.querySelectorAll('.glossary-term[data-definition]');
            glossaryElements.forEach((element: Element) => {
              const definition = element.getAttribute('data-definition');
              if (definition && element instanceof HTMLElement) {
                createTooltip(element, definition);
              }
            });
          },
        }),
      }),
    ];
  },
});