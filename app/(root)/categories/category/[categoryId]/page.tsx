import { createClient } from '@/providers/supabase/server';
import CategoryForm from './components/category-form';

const CategoryContentPage = async ({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) => {
  const { categoryId } = await params;
  const supabase = await createClient();

  // If categoryId is 'new', return empty category
  if (categoryId === 'new') {
    return (
      <div className="">
        <CategoryForm category={null} />
      </div>
    );
  }

  // Fetch existing category
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return <div className="px-4">No category found.</div>;
  }

  return (
    <div className="">
      <CategoryForm category={category} />
    </div>
  );
};

export default CategoryContentPage;
