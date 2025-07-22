import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React from 'react';

interface FootnotesV2NodeViewProps extends NodeViewProps {
  updateAttributes: (attributes: Record<string, unknown>) => void;
  deleteNode: () => void;
}

export const FootnotesV2NodeView: React.FC<FootnotesV2NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
}) => {
  return (
    <NodeViewWrapper className="footnotes-v2 mt-8 pt-8 border-t border-border">
      <div className="footnotes-v2-header mb-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          Footnotes
        </h4>
      </div>
      <ol className="list-decimal list-inside space-y-2">
        <NodeViewContent />
      </ol>
    </NodeViewWrapper>
  );
};