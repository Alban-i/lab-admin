import getPost from '@/actions/get-post';
import getAuthors from '@/actions/get-authors';
import getCategories from '@/actions/get-categories';
import PostForm from './components/post-form';

const PostContentPage = async ({
  params,
}: {
  params: Promise<{ postId: string }>;
}) => {
  const { postId } = await params;

  const [post, categories, authors] = await Promise.all([
    getPost(postId),
    getCategories(),
    getAuthors(),
  ]);

  if (post === 'error') {
    return <div className="px-4">No post found.</div>;
  }

  return (
    <div className="">
      <PostForm post={post} categories={categories} authors={authors} />
    </div>
  );
};

export default PostContentPage;
