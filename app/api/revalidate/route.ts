import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verify the secret token from the backend
    const token = request.headers.get('x-revalidate-token');

    if (!token || token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json(
        { revalidated: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { revalidated: false, message: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Revalidate the specific article path
    const articlePath = `/articles/article/${slug}`;
    revalidatePath(articlePath);

    // You might also want to revalidate the articles list page if you have one
    revalidatePath('/articles');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      paths: [articlePath, '/articles'],
    });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
