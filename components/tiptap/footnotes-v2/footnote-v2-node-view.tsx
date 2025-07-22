import { NodeViewContent, NodeViewWrapper, NodeViewProps, Editor } from '@tiptap/react';
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FootnoteV2NodeViewProps extends NodeViewProps {
  updateAttributes: (attributes: Record<string, unknown>) => void;
  deleteNode: () => void;
  editor: Editor;
}

export const FootnoteV2NodeView: React.FC<FootnoteV2NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
}) => {
  const footnoteId = node.attrs.id;

  // Calculate the footnote reference number by finding the corresponding reference
  const referenceNumber = useMemo(() => {
    if (!footnoteId || !editor) return 1;

    const { doc } = editor.state;
    let foundNumber = 1;
    let count = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.descendants((descendantNode: any) => {
      if (descendantNode.type.name === 'footnoteReferenceV2') {
        if (descendantNode.attrs.footnoteId === footnoteId) {
          foundNumber = count;
          return false; // Stop searching
        }
        count += 1;
      }
      return true;
    });

    return foundNumber;
  }, [footnoteId, editor]);

  const handleBackNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Find the corresponding reference and scroll to it
    if (footnoteId) {
      const { doc } = editor.state;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.descendants((refNode: any, pos: number) => {
        if (
          refNode.type.name === 'footnoteReferenceV2' &&
          refNode.attrs.footnoteId === footnoteId
        ) {
          // Scroll to the reference position
          editor.commands.setTextSelection(pos);
          editor.commands.scrollIntoView();
          
          // Briefly highlight the reference
          const referenceElement = document.querySelector(
            `span[data-footnote-id="${footnoteId}"][data-type="footnote-reference-v2"]`
          );
          if (referenceElement) {
            referenceElement.classList.add('footnote-highlight');
            setTimeout(() => {
              referenceElement.classList.remove('footnote-highlight');
            }, 2000);
          }
          return false; // Stop searching
        }
        return true;
      });
    }
  };

  const handleDelete = () => {
    // Find and remove corresponding footnote reference
    if (footnoteId) {
      const { doc } = editor.state;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.descendants((refNode: any, pos: number) => {
        if (
          refNode.type.name === 'footnoteReferenceV2' &&
          refNode.attrs.footnoteId === footnoteId
        ) {
          editor.commands.deleteRange({ from: pos, to: pos + refNode.nodeSize });
          return false;
        }
        return true;
      });
    }

    // Delete the footnote itself
    deleteNode();
  };

  return (
    <NodeViewWrapper className="footnote-v2 relative group">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={handleBackNavigation}
          className="footnote-back-link text-primary hover:underline cursor-pointer font-medium shrink-0"
          title={`Go to reference ${referenceNumber}`}
        >
          {referenceNumber}.
        </button>
        <div className="flex-1">
          <NodeViewContent className="footnote-v2-content" />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          title="Delete footnote"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </NodeViewWrapper>
  );
};