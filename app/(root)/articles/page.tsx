import getArticles from '@/actions/get-articles';
import ArticlesClient from './components/articles-client';

const ArticlesPage = async () => {
  const articles = await getArticles();

  return (
    <div className="">
      <ArticlesClient articles={articles} />
    </div>
  );
};

export default ArticlesPage;
