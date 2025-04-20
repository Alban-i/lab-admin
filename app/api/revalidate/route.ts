import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verify the secret token from the backend
    const token = request.headers.get('x-revalidate-token');

    if (!token || token !== process.env.FRONTEND_REVALIDATE_TOKEN) {
      return NextResponse.json(
        { revalidated: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { paths } = await request.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { revalidated: false, message: 'At least one path is required' },
        { status: 400 }
      );
    }

    // Revalidate all provided paths
    paths.forEach((path) => {
      revalidatePath(path);
    });

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      paths,
    });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
