import { Node as TipTapNode, mergeAttributes, CommandProps } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { ReactNodeViewRenderer } from '@tiptap/react';
import AudioNodeView from './audio-node-view';

export interface AudioOptions {
  inline: boolean;
  HTMLAttributes: Record<string, string | number | boolean>;
}

export const CustomAudioExtension = TipTapNode.create<AudioOptions>({
  name: 'audio',
  group: 'block',
  inline: false,
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio[data-audio]',
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          return {
            src: element.getAttribute('src'),
            title: element.getAttribute('title'),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }: { node: Node; HTMLAttributes: Record<string, unknown> }) {
    return [
      'audio',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-audio': true,
        src: node.attrs.src,
        title: node.attrs.title,
      }),
    ];
  },

  addCommands() {
    return {
      setAudio:
        (options: { src?: string; title?: string }) =>
        ({ chain, state }: CommandProps) => {
          const { selection } = state;
          const position = selection.$anchor.pos;

          return chain()
            .focus()
            .insertContentAt(position, {
              type: this.name,
              attrs: options,
            })
            .run();
        },
      deleteAudio:
        () =>
        ({ commands }: CommandProps) => {
          return commands.deleteSelection();
        },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView, {
      stopEvent: ({ event }) => {
        // Allow drag events to bubble for drag-and-drop functionality
        if (event.type === 'dragstart' || event.type === 'drop' || event.type === 'dragend') {
          return false;
        }
        // Stop all other events from propagating to ProseMirror
        return true;
      },
      ignoreMutation: ({ mutation }) => {
        // Don't ignore selection mutations - let ProseMirror handle them
        if (mutation.type === 'selection') {
          return false;
        }
        // Ignore all other mutations (attributes, childList, characterData)
        // This prevents ProseMirror from re-rendering when audio state changes internally
        return true;
      },
    });
  },
});
