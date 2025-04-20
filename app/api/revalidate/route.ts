import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { revalidated: false, message: 'Path parameter is required' },
        { status: 400 }
      );
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
      body: JSON.stringify({ path }),
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
