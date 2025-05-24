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
 * Quote node-view with an optional source label / URL and a **drag handle only**.
 *
 * – The node spec must have `draggable: true` (done in QuoteWithSource.ts).
 * – We do **not** put `draggable="true"` on the wrapper itself, so the block
 *   can be dragged **exclusively** with the handle.
 */
const QuoteNodeView = ({ node, updateAttributes }: NodeViewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [label, setLabel] = useState(node.attrs.sourceLabel || '');
  const [url, setUrl] = useState(node.attrs.sourceUrl || '');
  const [quoteType, setQuoteType] = useState(node.attrs.quoteType || 'regular');

  const handleSave = () => {
    updateAttributes({ sourceLabel: label, sourceUrl: url });
    setDialogOpen(false);
  };

  const handleTypeChange = (type: 'regular' | 'hadith' | 'quran') => {
    setQuoteType(type);
    updateAttributes({ quoteType: type });
  };

  return (
    <NodeViewWrapper
      /**
       * No `draggable` attribute here → empty areas aren't draggable.
       * Dragging is triggered only from the element that bears
       * `data-drag-handle` below.
       */
      className={`relative group p-0 rounded border-l-4 shadow-sm ${
        quoteType === 'quran' ? 'text-center' : ''
      }`}
      style={{
        background: 'var(--muted)',
        color: 'var(--foreground)',
        borderLeftColor: quoteType === 'hadith' ? 'orange' : 'var(--primary)',
        fontFamily: quoteType === 'quran' ? 'Amiri, serif' : undefined,
      }}
    >
      {/* DRAG HANDLE – grab the dots to move the node */}
      <span
        contentEditable={false}
        data-drag-handle
        className="absolute -left-4 top-2 cursor-grab opacity-0 group-hover:opacity-100 select-none text-muted-foreground"
      >
        ⋮⋮
      </span>

      {/* CONTROLS */}
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
        {/* BIG ICON ON THE RIGHT */}
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
