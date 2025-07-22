import { NodeViewWrapper, NodeViewProps, Editor } from '@tiptap/react';
import React, { useMemo } from 'react';

interface FootnoteReferenceV2NodeViewProps extends NodeViewProps {
  updateAttributes: (attributes: Record<string, unknown>) => void;
  deleteNode: () => void;
  editor: Editor;
}

export const FootnoteReferenceV2NodeView: React.FC<FootnoteReferenceV2NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
}) => {
  const footnoteId = node.attrs.footnoteId;

  // Get the footnote number from node attributes (managed by FootnoteV2Rules)
  const footnoteNumber = node.attrs.referenceNumber || '1';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Find the corresponding footnote and scroll to it
    if (footnoteId) {
      // Find specifically the footnote element (li element), not the reference
      const footnoteElement = document.querySelector(
        `li[data-footnote-id="${footnoteId}"][data-type="footnote-v2"]`
      );
      if (footnoteElement) {
        footnoteElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        
        // Briefly highlight the footnote
        footnoteElement.classList.add('footnote-highlight');
        setTimeout(() => {
          footnoteElement.classList.remove('footnote-highlight');
        }, 2000);
      }
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      className="footnote-reference-v2 text-primary align-super text-xs cursor-pointer ml-0.5 hover:underline"
      onClick={handleClick}
      title={`Footnote ${footnoteNumber}`}
    >
      {footnoteNumber}
    </NodeViewWrapper>
  );
};