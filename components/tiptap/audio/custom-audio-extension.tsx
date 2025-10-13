import { Node as TipTapNode, mergeAttributes } from '@tiptap/core';
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
      nodeId: {
        default: null,
        // Generate unique ID on parse to help ProseMirror track nodes correctly
        // This prevents re-renders when content is added before the audio node
        parseHTML: () => crypto.randomUUID(),
        rendered: false,
      },
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


  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView, {
      // Ignore mutations from the audio element's internal state changes
      // to prevent unnecessary re-renders when audio is playing/paused or time updates
      ignoreMutation: ({ mutation }) => {
        // Ignore all mutations within the audio element
        // This prevents re-renders when audio time updates, play/pause state changes
        if (
          mutation.type === 'attributes' ||
          mutation.type === 'characterData' ||
          mutation.type === 'childList'
        ) {
          return true;
        }
        return false;
      },
    });
  },
});
