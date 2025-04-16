import getArticle from '@/actions/get-article';
import getArticleTags from '@/actions/get-article-tags';
import getCategories from '@/actions/get-categories';
import getTags from '@/actions/get-tags';
import ArticleForm from './components/article-form';

const ArticlePage = async ({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) => {
  const { articleId } = await params;

  const [article, categories, tags, articleTags] = await Promise.all([
    getArticle(articleId),
    getCategories(),
    getTags(),
    getArticleTags(articleId),
  ]);

  if (article === 'error') {
    return <div className="px-4">Aucun article n'a été trouvée.</div>;
  }

  return (
    <div className="">
      <ArticleForm
        article={article}
        categories={categories}
        tags={tags}
        selectedTagIds={articleTags}
      />
    </div>
  );
};

export default ArticlePage;
