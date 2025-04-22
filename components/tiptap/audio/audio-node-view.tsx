import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const AudioNodeView = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  getPos,
}: NodeViewProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [metadata, setMetadata] = useState<{
    title?: string;
    artist?: string;
    album?: string;
  }>({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // Try to get ID3 metadata if available
      if ('mediaSession' in navigator) {
        const mediaMetadata = navigator.mediaSession.metadata;
        if (mediaMetadata) {
          setMetadata({
            title: mediaMetadata.title || node.attrs.title,
            artist: mediaMetadata.artist,
            album: mediaMetadata.album,
          });
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [node.attrs.title]);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const skip = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(audioRef.current.duration, audioRef.current.currentTime + delta)
    );
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
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
        <audio
          ref={audioRef}
          src={node.attrs.src}
          title={node.attrs.title || ''}
          draggable={false}
          className="w-full"
          onEnded={() => setPlaying(false)}
        />
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
                deleteNode();
              }}
              className="p-1 hover:bg-black/20 rounded cursor-pointer"
              title="Delete audio"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          </div>
        )}
        <div className="p-4 bg-gray-50 rounded-md" contentEditable={false}>
          <div className="space-y-2">
            {/* Title and metadata */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {metadata.title || node.attrs.title}
                </div>
                {(metadata.artist || metadata.album) && (
                  <div className="text-sm text-gray-500">
                    {metadata.artist && <span>{metadata.artist}</span>}
                    {metadata.artist && metadata.album && <span> • </span>}
                    {metadata.album && <span>{metadata.album}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="h-1.5 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={(e) => skip(e, -10)}
                title="« 10s"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={togglePlay}
                title={playing ? 'Pause' : 'Play'}
                type="button"
              >
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={(e) => skip(e, 10)}
                title="10s »"
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Time display */}
              <div className="ml-2 text-sm text-gray-600 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default AudioNodeView;
