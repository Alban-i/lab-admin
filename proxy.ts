import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/providers/supabase/middleware';
import {
  getArticleSlugById,
  getPostSlugById,
  getMediaSlugById,
  getCategorySlugById,
  getTagSlugById,
  getRoleSlugById,
  getTypeSlugById,
  getIndividualSlugById,
} from '@/lib/redirects';

export async function proxy(request: NextRequest) {
  console.log('Request URL:', request.url);
  
  const { pathname } = request.nextUrl;
  
  // Handle ID-based URL redirects to slug-based URLs
  const redirectUrl = await handleIdRedirects(request, pathname);
  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl);
  }
  
  return await updateSession(request);
}

async function handleIdRedirects(request: NextRequest, pathname: string): Promise<URL | null> {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const numericPattern = /^\d+$/;
  
  // Article redirects: /articles/[uuid] -> /articles/[slug]
  const articleMatch = pathname.match(/^\/articles\/([a-f0-9-]+)$/);
  if (articleMatch && uuidPattern.test(articleMatch[1])) {
    const slug = await getArticleSlugById(articleMatch[1]);
    if (slug) {
      const url = new URL(request.url);
      url.pathname = `/articles/${slug}`;
      return url;
    }
  }
  
  // Post redirects: /posts/[number] -> /posts/[slug]
  const postMatch = pathname.match(/^\/posts\/(\d+)$/);
  if (postMatch && numericPattern.test(postMatch[1])) {
    const slug = await getPostSlugById(postMatch[1]);
    if (slug) {
      const url = new URL(request.url);
      url.pathname = `/posts/${slug}`;
      return url;
    }
  }
  
  // Media redirects: /media/[type]/[uuid] -> /media/[type]/[slug]
  const mediaMatch = pathname.match(/^\/media\/(audio|images|videos|documents)\/([a-f0-9-]+)$/);
  if (mediaMatch && uuidPattern.test(mediaMatch[2])) {
    const slug = await getMediaSlugById(mediaMatch[2]);
    if (slug) {
      const url = new URL(request.url);
      url.pathname = `/media/${mediaMatch[1]}/${slug}`;
      return url;
    }
  }
  
  // Category redirects: /categories/[number] -> /categories/[slug]
  const categoryMatch = pathname.match(/^\/categories\/(\d+)$/);
  if (categoryMatch && numericPattern.test(categoryMatch[1])) {
    const slug = await getCategorySlugById(categoryMatch[1]);
    if (slug) {
      const url = new URL(request.url);
      url.pathname = `/categories/${slug}`;
      return url;
    }
  }
  
  // Tag redirects: /tags/[number] -> /tags/[slug]
  const tagMatch = pathname.match(/^\/tags\/(\d+)$/);
  if (tagMatch && numericPattern.test(tagMatch[1])) {
    const slug = await getTagSlugById(tagMatch[1]);
    if (slug) {
      const url = new URL(request.url);
      url.pathname = `/tags/${slug}`;
      return url;
    }
  }
  
  // Role redirects: /roles/[number] -> /roles/[slug]
  const roleMatch = pathname.match(/^\/roles\/(\d+)$/);
  if (roleMatch && numericPattern.test(roleMatch[1])) {
    const slug = await getRoleSlugById(roleMatch[1]);
    if (slug) {
      const url = new URL(request.url);
      url.pathname = `/roles/${slug}`;
      return url;
    }
  }
  
  // Type redirects: /types/[number] -> /types/[slug]
  const typeMatch = pathname.match(/^\/types\/(\d+)$/);
  if (typeMatch && numericPattern.test(typeMatch[1])) {
    const slug = await getTypeSlugById(typeMatch[1]);
    if (slug) {
      const url = new URL(request.url);
      url.pathname = `/types/${slug}`;
      return url;
    }
  }
  
  // Individual redirects: /individuals/[number] -> /individuals/[slug]
  const individualMatch = pathname.match(/^\/individuals\/(\d+)$/);
  if (individualMatch && numericPattern.test(individualMatch[1])) {
    const slug = await getIndividualSlugById(individualMatch[1]);
    if (slug) {
      const url = new URL(request.url);
      url.pathname = `/individuals/${slug}`;
      return url;
    }
  }
  
  return null;
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
