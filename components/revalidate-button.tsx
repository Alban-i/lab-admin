'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface RevalidateButtonProps {
  path: string;
  label: string;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

export const RevalidateButton = ({
  path,
  label,
  className,
  variant = 'outline',
}: RevalidateButtonProps) => {
  const [isRevalidating, setIsRevalidating] = useState(false);

  // For keeping consistent width of button
  const [minWidth, setMinWidth] = useState<number | undefined>(undefined);
  const btnRef = useRef<HTMLButtonElement>(null);

  // on first render (or whenever `label` changes) measure your button
  useEffect(() => {
    if (btnRef.current) {
      setMinWidth(btnRef.current.offsetWidth);
    }
  }, [label]);

  const handleRevalidate = async () => {
    setIsRevalidating(true);
    try {
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Front-end website revalidated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to revalidate front-end website');
    } finally {
      setIsRevalidating(false);
    }
  };

  return (
    <Button
      ref={btnRef}
      style={minWidth ? { minWidth } : undefined}
      type="button"
      variant={variant}
      disabled={isRevalidating}
      onClick={handleRevalidate}
      className={className}
    >
      <span className="flex items-center gap-2">
        <RefreshCcw
          className={`h-4 w-4 ${isRevalidating ? 'animate-spin' : ''}`}
        />
        {isRevalidating ? 'Revalidating...' : label}
      </span>
    </Button>
  );
};
