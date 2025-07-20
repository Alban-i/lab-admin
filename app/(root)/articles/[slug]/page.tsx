import getArticle from '@/actions/get-article';
import getArticleTags from '@/actions/get-article-tags';
import getAuthors from '@/actions/get-authors';
import getCategories from '@/actions/get-categories';
import getTags from '@/actions/get-tags';
import ArticleForm from './components/article-form';

const ArticlePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const [article, categories, tags, articleTags, authors] = await Promise.all([
    getArticle(slug),
    getCategories(),
    getTags(),
    getArticleTags(slug),
    getAuthors(),
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
        authors={authors}
      />
    </div>
  );
};

export default ArticlePage;
