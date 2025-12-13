import { NextResponse } from 'next/server';

/**
 * Convert a path to cache tags for revalidation.
 * Used for backwards compatibility with path-based revalidation.
 */
function pathToTags(path: string): string[] {
  // Media paths - no frontend cache to revalidate
  if (path.startsWith('/media')) {
    return [];
  }

  // Convert common paths to tags
  if (path === '/' || path === '') {
    return ['articles', 'latest-articles', 'top-articles', 'featured-article', 'posts'];
  }

  if (path === '/articles' || path.startsWith('/articles')) {
    return ['articles', 'latest-articles', 'top-articles', 'featured-article'];
  }

  if (path === '/posts' || path.startsWith('/posts')) {
    return ['posts'];
  }

  if (path === '/individuals' || path.startsWith('/individuals')) {
    return ['individuals'];
  }

  // Default: return empty array (nothing to revalidate)
  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, tags: providedTags } = body;

    // Determine tags to revalidate
    let tags: string[] = [];

    if (providedTags && Array.isArray(providedTags)) {
      // New tag-based approach
      tags = providedTags;
    } else if (path) {
      // Legacy path-based approach - convert to tags
      tags = pathToTags(path);
    }

    if (tags.length === 0) {
      return NextResponse.json({
        revalidated: true,
        message: 'No cache tags to revalidate',
        tags: [],
      });
    }

    // Get the frontend revalidation configuration
    const frontendRevalidateUrl = process.env.FRONTEND_REVALIDATE_URL;
    const frontendRevalidateToken = process.env.FRONTEND_REVALIDATE_TOKEN;

    if (!frontendRevalidateUrl || !frontendRevalidateToken) {
      return NextResponse.json(
        {
          revalidated: false,
          message:
            'Frontend revalidation configuration is missing. Please set FRONTEND_REVALIDATE_URL and FRONTEND_REVALIDATE_TOKEN environment variables.',
        },
        { status: 500 }
      );
    }

    // Make the request to the frontend's revalidation endpoint
    const response = await fetch(frontendRevalidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-token': frontendRevalidateToken,
      },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        {
          revalidated: false,
          message: `Frontend revalidation failed: ${error.message}`,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      revalidated: true,
      tags,
      frontendResponse: result,
    });
  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json(
      { revalidated: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
