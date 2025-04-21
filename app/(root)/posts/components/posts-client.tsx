'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Posts } from '@/types/types';
import Link from 'next/link';
import { DataTable } from './data-table';
import { columns } from './columns';
import { ArticleStatus } from '@/types/types';
import { RevalidateButton } from '@/components/revalidate-button';
interface PostsClientProps {
  posts: Posts[];
}

const PostsClient: React.FC<PostsClientProps> = ({ posts }) => {
  const refinedPosts = posts.map(({ id, title, status }) => ({
    id: id.toString(),
    title: title ?? '',
    status: (status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()) as ArticleStatus,
  }));

  return (
    <div className="grid gap-3 px-4">
      {/* TOP FIRST LINE */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Posts</h2>
        <div className="ml-auto flex items-center gap-2">
          <RevalidateButton path="/posts" label="Revalidate Posts Page" />

          {/* NEW POST */}
          <Link href="/posts/new" passHref>
            <Button className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New
              </span>
            </Button>
          </Link>
        </div>
      </div>

      <DataTable data={refinedPosts} columns={columns} />
    </div>
  );
};

export default PostsClient;
