import { useState } from 'react';
import { NodeViewWrapper, NodeViewProps, NodeViewContent } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Quote as QuoteIcon } from 'lucide-react';

/**
 * Quote node-view with :
 *   • optional *source* (label + URL)
 *   • style switch (regular / hadith / Qur’an)
 *   • **drag handle** limited to the “⋮⋮” dots
 *
 * Implementation notes
 * --------------------
 * • The node spec has `draggable: true`, so ProseMirror attaches the built-in
 *   drag behaviour to the *root* DOM element (rendered by <NodeViewWrapper />).
 * • We prevent accidental drags from empty areas by cancelling `dragstart`
 *   unless the event originates from the element that bears
 *   `data-drag-handle`.
 * • To get rid of the default grey “ghost” icon the browser shows while
 *   dragging, we set an **empty 1×1 transparent drag image** on the handle’s
 *   own `dragstart`.
 */
const QuoteNodeView = ({ node, updateAttributes }: NodeViewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [label, setLabel] = useState(node.attrs.sourceLabel || '');
  const [url, setUrl] = useState(node.attrs.sourceUrl || '');
  const [quoteType, setQuoteType] = useState<'regular' | 'hadith' | 'quran'>(
    node.attrs.quoteType || 'regular'
  );

  /* -------------------------------------------------- actions */
  const handleSave = () => {
    updateAttributes({ sourceLabel: label, sourceUrl: url });
    setDialogOpen(false);
  };

  const handleTypeChange = (type: 'regular' | 'hadith' | 'quran') => {
    setQuoteType(type);
    updateAttributes({ quoteType: type });
  };

  /* -------------------------------------------------- drag logic */
  const cancelIfNotHandle: React.DragEventHandler = (e) => {
    if (!(e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const hideGhostImage: React.DragEventHandler = (e) => {
    // 1×1 px transparent gif
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    e.dataTransfer?.setDragImage(img, 0, 0);
  };

  /* -------------------------------------------------- render */
  return (
    <NodeViewWrapper
      onDragStart={cancelIfNotHandle} /* filter drag origin */
      className={`relative group rounded border-l-4 shadow-sm p-0 ${
        quoteType === 'quran' ? 'text-center' : ''
      }`}
      style={{
        background: 'var(--muted)',
        color: 'var(--foreground)',
        borderLeftColor: quoteType === 'hadith' ? 'orange' : 'var(--primary)',
        fontFamily: quoteType === 'quran' ? 'Amiri, serif' : undefined,
      }}
    >
      {/* DRAG HANDLE */}
      <span
        contentEditable={false}
        data-drag-handle
        draggable="true" /* key: origin of valid drags */
        onDragStart={hideGhostImage} /* remove default ghost icon */
        className="absolute left-0 top-2 w-6 h-6 flex items-center justify-center cursor-grab select-none text-muted-foreground z-50"
      >
        ⋮⋮
      </span>

      {/* CONTROL BAR */}
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2"
        contentEditable={false}
      >
        <Button
          variant={quoteType === 'hadith' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('hadith')}
          aria-label="Set as Hadith"
          type="button"
        >
          H
        </Button>
        <Button
          variant={quoteType === 'quran' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('quran')}
          aria-label="Set as Qur'an"
          type="button"
        >
          Q
        </Button>
        <Button
          variant={quoteType === 'regular' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('regular')}
          aria-label="Set as Regular"
          type="button"
        >
          R
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" type="button">
              Edit Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Source</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Source label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <Input
                placeholder="Source URL (optional)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button onClick={handleSave} type="button">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* BODY */}
      <blockquote className="m-0 p-0 border-none bg-transparent">
        <NodeViewContent as="div" />
        {node.attrs.sourceLabel && (
          <div
            className="absolute bottom-2 right-4 text-xs pointer-events-none text-muted-foreground"
            contentEditable={false}
          >
            {node.attrs.sourceUrl ? (
              <a
                href={node.attrs.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {node.attrs.sourceLabel}
              </a>
            ) : (
              node.attrs.sourceLabel
            )}
          </div>
        )}

        {/* DECORATIVE ICON */}
        <span
          className="pointer-events-none select-none absolute top-1/2 right-6 -translate-y-1/2 opacity-10 text-[64px] font-bold"
          aria-hidden="true"
        >
          {quoteType === 'regular' && <QuoteIcon className="w-16 h-16" />}
          {quoteType === 'quran' && <span className="font-serif">Q</span>}
          {quoteType === 'hadith' && <span className="font-serif">H</span>}
        </span>
      </blockquote>
    </NodeViewWrapper>
  );
};

export default QuoteNodeView;
