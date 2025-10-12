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
    return [{ tag: 'audio[data-audio]' }];
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
      // Prevent TipTap from destroying the node view when audio element's internal state changes
      ignoreMutation: (mutation) => {
        // Ignore mutations to the audio element itself (loading, time updates, playing state, etc.)
        if (mutation.target.nodeName === 'AUDIO') {
          return true;
        }

        // Ignore attribute changes on the audio element
        if (mutation.type === 'attributes' && mutation.target.nodeName === 'AUDIO') {
          return true;
        }

        // Allow all other mutations (TipTap needs to track changes to the wrapper/controls)
        return false;
      },
    });
  },
});
