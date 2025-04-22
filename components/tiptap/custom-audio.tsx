import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import AudioNodeView from './audio-node-view';

export interface AudioOptions {
  inline: boolean;
  HTMLAttributes: Record<string, string | number | boolean>;
}

export const CustomAudio = Node.create<AudioOptions>({
  name: 'audio',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      inline: true,
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

  renderHTML({ node, HTMLAttributes }) {
    return [
      'audio',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-audio': true,
        src: node.attrs.src,
        title: node.attrs.title,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView);
  },
});
