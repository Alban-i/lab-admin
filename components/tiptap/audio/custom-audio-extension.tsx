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
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {
              'data-id': `audio-${Math.random().toString(36).substr(2, 9)}`,
            };
          }
          return {
            'data-id': attributes.id,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'audio[data-audio]' }];
  },

  renderHTML({ node, HTMLAttributes }: { node: Node; HTMLAttributes: Record<string, unknown> }) {
    // Generate unique ID if not present to help ProseMirror track this node
    const id = node.attrs.id || `audio-${Math.random().toString(36).substr(2, 9)}`;
    return [
      'audio',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-audio': true,
        'data-id': id,
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
    return ReactNodeViewRenderer(AudioNodeView);
  },
});
