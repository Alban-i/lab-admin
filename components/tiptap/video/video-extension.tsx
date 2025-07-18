import { Node, mergeAttributes, CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import VideoNodeView from './video-node-view';

export interface VideoOptions {
  inline: boolean;
  HTMLAttributes: Record<string, string | number | boolean>;
}

export const CustomVideoExtension = Node.create<VideoOptions>({
  name: 'video',
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
      poster: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'video[data-video]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-video': true,
        src: node.attrs.src,
        title: node.attrs.title,
        poster: node.attrs.poster,
        controls: true,
        preload: 'metadata',
      }),
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options: { src?: string; title?: string; poster?: string }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      deleteVideo:
        () =>
        ({ commands }: CommandProps) => {
          return commands.deleteSelection();
        },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});