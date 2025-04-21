import getPosts from '@/actions/get-posts';
import PostsClient from './components/posts-client';
import wait from '@/hooks/use-wait';

const PostsPage = async () => {
  const posts = await getPosts();

  await wait(5000);

  return (
    <div className="">
      <PostsClient posts={posts} />
    </div>
  );
};

export default PostsPage;
