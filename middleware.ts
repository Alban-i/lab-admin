import { type NextRequest } from 'next/server';
import { updateSession } from '@/providers/supabase/middleware';

export async function middleware(request: NextRequest) {
  console.log('Request URL:', request.url);
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .css (CSS files)
     * - api (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css)$).*)',
  ],
};
