'use client';

import { PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Articles } from '@/types/types';
import Link from 'next/link';
import { DataTable } from './data-table';
import { columns } from './columns';
import { useState } from 'react';
import { toast } from 'sonner';

interface ArticlesClientProps {
  articles: Articles[];
}

const ArticlesClient: React.FC<ArticlesClientProps> = ({ articles }) => {
  const [isRevalidating, setIsRevalidating] = useState(false);

  const refinedArticles = articles.map(({ id, title, status }) => ({
    id,
    title: title ?? '',
    status,
  }));

  const triggerRevalidation = async () => {
    try {
      setIsRevalidating(true);
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paths: ['/articles'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to revalidate');
      }

      toast.success('Front-end website revalidated successfully');
    } catch (error) {
      toast.error('Failed to revalidate front-end website');
      console.error('Error revalidating:', error);
    } finally {
      setIsRevalidating(false);
    }
  };

  return (
    <div className="grid gap-3 px-4">
      {/* TOP FIRST LINE */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Articles</h2>
        <div className="ml-auto flex items-center gap-2">
          {/* REVALIDATE BUTTON */}
          <Button
            variant="outline"
            onClick={triggerRevalidation}
            disabled={isRevalidating}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-2 ${
                isRevalidating ? 'animate-spin' : ''
              }`}
            />
            {isRevalidating ? 'Revalidating...' : 'Revalidate Articles List'}
          </Button>
          {/* NEW ARTICLE */}
          <Link href="/articles/article/new" passHref>
            <Button className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New
              </span>
            </Button>
          </Link>
        </div>
      </div>

      <DataTable data={refinedArticles} columns={columns} />
    </div>
  );
};

export default ArticlesClient;
