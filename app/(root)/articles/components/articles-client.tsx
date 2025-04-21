'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Articles } from '@/types/types';
import Link from 'next/link';
import { DataTable } from './data-table';
import { columns } from './columns';
import { RevalidateButton } from '@/components/revalidate-button';
interface ArticlesClientProps {
  articles: Articles[];
}

const ArticlesClient: React.FC<ArticlesClientProps> = ({ articles }) => {
  const refinedArticles = articles.map(({ id, title, status }) => ({
    id,
    title: title ?? '',
    status,
  }));

  return (
    <div className="grid gap-3 px-4">
      {/* TOP FIRST LINE */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Articles</h2>
        <div className="ml-auto flex items-center gap-2">
          <RevalidateButton path="/articles" label="Revalidate Articles Page" />

          {/* NEW ARTICLE */}
          <Link href="/articles/new" passHref>
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
