import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Trash2, ExternalLink } from 'lucide-react';

const DocumentNodeView = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  getPos,
}: NodeViewProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType?.toLowerCase().includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    if (fileType?.toLowerCase().includes('doc')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }
    if (fileType?.toLowerCase().includes('xls')) {
      return <FileText className="h-6 w-6 text-green-500" />;
    }
    if (fileType?.toLowerCase().includes('ppt')) {
      return <FileText className="h-6 w-6 text-orange-500" />;
    }
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (size: number) => {
    if (!size) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }

    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.attrs.src) {
      window.open(node.attrs.src, '_blank');
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const nodeData = {
      pos: getPos(),
      node: node.toJSON(),
    };
    e.dataTransfer.setData('application/json', JSON.stringify(nodeData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <NodeViewWrapper className="relative">
      <div
        draggable={true}
        onDragStart={(e: React.DragEvent) => {
          e.stopPropagation();
          handleDragStart(e);
        }}
        onDragEnd={(e: React.DragEvent) => {
          e.stopPropagation();
          handleDragEnd();
        }}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
        }}
        className="relative"
      >
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors" contentEditable={false}>
          <div className="flex items-center gap-3">
            {/* File icon */}
            <div className="flex-shrink-0">
              {getFileIcon(node.attrs.fileType)}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {node.attrs.title || 'Untitled Document'}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                {node.attrs.fileType && (
                  <span className="uppercase">{node.attrs.fileType}</span>
                )}
                {node.attrs.fileSize && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(node.attrs.fileSize)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleDownload}
                title="Download/Open"
                type="button"
                variant="ghost"
                className="hover:bg-gray-200"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                title="Download"
                type="button"
                variant="ghost"
                className="hover:bg-gray-200"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Edit controls when selected */}
        {selected && (
          <div
            className="absolute top-2 right-2 flex gap-2 bg-black/50 p-2 rounded"
            contentEditable={false}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const newTitle = window.prompt(
                  'Enter title:',
                  node.attrs.title
                );
                if (newTitle !== null) {
                  updateAttributes({ title: newTitle });
                }
              }}
              className="p-1 text-white text-xs font-semibold hover:bg-black/20 rounded cursor-pointer"
              title="Edit title"
            >
              Title
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const newFileType = window.prompt(
                  'Enter file type:',
                  node.attrs.fileType
                );
                if (newFileType !== null) {
                  updateAttributes({ fileType: newFileType });
                }
              }}
              className="p-1 text-white text-xs font-semibold hover:bg-black/20 rounded cursor-pointer"
              title="Edit file type"
            >
              Type
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              className="p-1 hover:bg-black/20 rounded cursor-pointer"
              title="Delete document"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default DocumentNodeView;