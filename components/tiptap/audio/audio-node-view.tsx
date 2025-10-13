import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useRef, useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Play, Pause, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const AudioNodeView = memo(({
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const durationSetRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current) return;

    // Reset state when src changes
    setError(null);
    setPlaying(false);
    setCurrentTime(0);
    durationSetRef.current = false;

    // Validate source
    if (!node.attrs.src) {
      setError('No audio source provided');
      setLoading(false);
      return;
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        if (!durationSetRef.current) {
          setDuration(audio.duration);
          durationSetRef.current = true;
        }
        // Always set loading to false when we have valid metadata
        setLoading(false);
      }

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

    const handleDurationChange = () => {
      // Only update duration if we haven't set it yet and it's valid
      if (isFinite(audio.duration) && audio.duration > 0) {
        if (!durationSetRef.current) {
          setDuration(audio.duration);
          durationSetRef.current = true;
        }
        // Always set loading to false when we have valid duration
        setLoading(false);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setPlaying(true);
    };

    const handlePause = () => {
      setPlaying(false);
    };

    const handleEnded = () => {
      setPlaying(false);
    };

    const handleError = () => {
      let errorMessage = 'Failed to load audio';
      if (audio.error) {
        switch (audio.error.code) {
          case 1:
            errorMessage = 'Audio loading aborted';
            break;
          case 2:
            errorMessage = 'Network error while loading audio';
            break;
          case 3:
            errorMessage = 'Audio decoding failed';
            break;
          case 4:
            errorMessage = 'Audio format not supported';
            break;
        }
      }
      setError(errorMessage);
      setLoading(false);
    };

    const handleLoadStart = () => {
      setLoading(true);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      // Cleanup: pause audio and remove all event listeners
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
    // Title is only used in metadata display, doesn't need to trigger re-setup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.attrs.src]);

  const togglePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;

    const audio = audioRef.current;

    try {
      if (playing) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      setError('Failed to play audio: ' + (error as Error).message);
      setPlaying(false);
    }
  };

  const skip = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;
    if (!isFinite(duration) || duration <= 0) return;

    const audio = audioRef.current;
    const newTime = Math.max(0, Math.min(duration, audio.currentTime + delta));
    audio.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    if (!isFinite(duration) || duration <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    audioRef.current.currentTime = newTime;
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
          preload="metadata"
          crossOrigin="anonymous"
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
                setTitleInput(node.attrs.title || '');
                setIsTitleDialogOpen(true);
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
        <div className="p-4 bg-gray-50 rounded-md border border-primary" contentEditable={false}>
          <div className="space-y-2">
            {/* Error message */}
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

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
                style={{
                  width: `${
                    duration > 0 && isFinite(duration)
                      ? (currentTime / duration) * 100
                      : 0
                  }%`
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={(e) => skip(e, -10)}
                title="« 10s"
                type="button"
                disabled={!!error}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={togglePlay}
                title={playing ? 'Pause' : 'Play'}
                type="button"
                disabled={!!error}
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
                disabled={!!error}
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

      {/* Title Edit Dialog */}
      <Dialog open={isTitleDialogOpen} onOpenChange={setIsTitleDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Audio Title</DialogTitle>
            <DialogDescription>
              Enter a new title for this audio file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Enter title..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  updateAttributes({ title: titleInput });
                  setIsTitleDialogOpen(false);
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTitleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateAttributes({ title: titleInput });
                setIsTitleDialogOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if node attributes or selection state actually changed
  return (
    prevProps.node.attrs.src === nextProps.node.attrs.src &&
    prevProps.node.attrs.title === nextProps.node.attrs.title &&
    prevProps.selected === nextProps.selected
  );
});

AudioNodeView.displayName = 'AudioNodeView';

export default AudioNodeView;
