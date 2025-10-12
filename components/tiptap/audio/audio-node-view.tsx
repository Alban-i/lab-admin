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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const durationSetRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current) return;

    // Only log and validate on first mount
    if (!initializedRef.current) {
      console.log('[AudioNodeView] Component mounted with src:', node.attrs.src);
      console.log('[AudioNodeView] Audio title:', node.attrs.title);

      if (!node.attrs.src) {
        console.error('[AudioNodeView] No audio source provided!');
        setError('No audio source provided');
        setLoading(false);
        return;
      }

      initializedRef.current = true;
    }

    const audio = audioRef.current;
    console.log('[AudioNodeView] Setting up event listeners');
    console.log('[AudioNodeView] Initial readyState:', audio.readyState);
    console.log('[AudioNodeView] Initial networkState:', audio.networkState);

    const handleLoadedMetadata = () => {
      console.log('[AudioNodeView] loadedmetadata event fired');
      console.log('[AudioNodeView] Audio duration:', audio.duration);
      console.log('[AudioNodeView] Duration is finite:', isFinite(audio.duration));
      console.log('[AudioNodeView] Duration set ref:', durationSetRef.current);

      if (isFinite(audio.duration) && audio.duration > 0) {
        if (!durationSetRef.current) {
          console.log('[AudioNodeView] Setting duration to:', audio.duration);
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
          console.log('[AudioNodeView] Media metadata found:', mediaMetadata);
          setMetadata({
            title: mediaMetadata.title || node.attrs.title,
            artist: mediaMetadata.artist,
            album: mediaMetadata.album,
          });
        }
      }
    };

    const handleDurationChange = () => {
      console.log('[AudioNodeView] durationchange event fired');
      console.log('[AudioNodeView] Current duration:', audio.duration);
      console.log('[AudioNodeView] Duration already set:', durationSetRef.current);

      // Only update duration if we haven't set it yet and it's valid
      if (isFinite(audio.duration) && audio.duration > 0) {
        if (!durationSetRef.current) {
          console.log('[AudioNodeView] Updating duration to:', audio.duration);
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
      console.log('[AudioNodeView] Audio started playing');
      setPlaying(true);
    };

    const handlePause = () => {
      console.log('[AudioNodeView] Audio paused');
      setPlaying(false);
    };

    const handleEnded = () => {
      console.log('[AudioNodeView] Audio playback ended');
      setPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error('[AudioNodeView] Audio error event:', e);
      console.error('[AudioNodeView] Audio error code:', audio.error?.code);
      console.error('[AudioNodeView] Audio error message:', audio.error?.message);
      console.error('[AudioNodeView] Network state:', audio.networkState);
      console.error('[AudioNodeView] Ready state:', audio.readyState);

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
      console.log('[AudioNodeView] Audio load started');
      setLoading(true);
    };

    const handleCanPlay = () => {
      console.log('[AudioNodeView] Audio can play');
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
      console.log('[AudioNodeView] Cleaning up event listeners');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) {
      console.warn('[AudioNodeView] togglePlay called but audioRef is null');
      return;
    }

    const audio = audioRef.current;
    console.log('[AudioNodeView] togglePlay called, current playing state:', playing);
    console.log('[AudioNodeView] Audio ready state:', audio.readyState);
    console.log('[AudioNodeView] Audio network state:', audio.networkState);
    console.log('[AudioNodeView] Audio paused:', audio.paused);

    try {
      if (playing) {
        console.log('[AudioNodeView] Attempting to pause audio');
        audio.pause();
      } else {
        console.log('[AudioNodeView] Attempting to play audio');
        await audio.play();
        console.log('[AudioNodeView] Play promise resolved successfully');
      }
    } catch (error) {
      console.error('[AudioNodeView] Audio playback error:', error);
      console.error('[AudioNodeView] Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        readyState: audio.readyState,
        networkState: audio.networkState,
      });
      setError('Failed to play audio: ' + (error as Error).message);
      setPlaying(false);
    }
  };

  const skip = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) {
      console.warn('[AudioNodeView] skip called but audioRef is null');
      return;
    }
    if (!isFinite(duration) || duration <= 0) {
      console.warn('[AudioNodeView] skip called but duration is invalid:', duration);
      return;
    }
    const audio = audioRef.current;
    const newTime = Math.max(0, Math.min(duration, audio.currentTime + delta));
    console.log('[AudioNodeView] Skipping from', audio.currentTime, 'to', newTime, 'delta:', delta);
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
    if (!audioRef.current) {
      console.warn('[AudioNodeView] handleProgressClick called but audioRef is null');
      return;
    }
    if (!isFinite(duration) || duration <= 0) {
      console.warn('[AudioNodeView] handleProgressClick called but duration is invalid:', duration);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    console.log('[AudioNodeView] Progress bar clicked, seeking to:', newTime, 'position:', pos);
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
          preload="none"
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
            {/* Error message */}
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Loading state */}
            {loading && !error && (
              <div className="text-sm text-gray-500">Loading audio...</div>
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
    </NodeViewWrapper>
  );
};

export default AudioNodeView;
