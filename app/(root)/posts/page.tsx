import getPosts from '@/actions/get-posts';
import PostsClient from './components/posts-client';

const PostsPage = async () => {
  const posts = await getPosts();

  return (
    <div className="">
      <PostsClient posts={posts} />
    </div>
  );
};

export default PostsPage;
