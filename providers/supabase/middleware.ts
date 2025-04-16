import { Database } from '@/types/types_db';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import {
  ROLE_ADMIN,
  ROLE_BANNED,
  ROLE_READER,
  ROLE_AUTHOR,
} from '@/constants/roles';

// Helper HTML for the form submission
const getSignOutFormHtml = (url: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body>
  <form action="${url}" method="POST" id="signout-form">
    <input type="hidden" name="redirect" value="true">
  </form>
  <script>
    document.getElementById('signout-form').submit();
  </script>
</body>
</html>
`;

export async function updateSession(request: NextRequest) {
  // Create the main response object
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Retrieve all cookies from the incoming request
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the supabaseResponse
          cookiesToSet.forEach(({ name, value }) => {
            supabaseResponse.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Fetch the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('user', user);
  console.log('current pathname:', request.nextUrl.pathname);

  // Redirect to login if no user is found and the route isn't public
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/api/auth') &&
    !request.nextUrl.pathname.startsWith('/reset-password')
  ) {
    console.log('Should redirect to login - condition met');
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    // Create a new redirect response
    const redirectResponse = NextResponse.redirect(url);

    // Copy all cookies from supabaseResponse to redirectResponse
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    }

    return redirectResponse;
  }

  // Check and set user role
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, role_id(value)')
      .eq('id', user.id)
      .single();

    console.log({ profile });

    const role = profile?.role_id?.value;

    // Define role-based protected routes
    const teacherRoutes = ['/', '/exams', '/courses']; // dashboard complement on dashboard page

    // Redirect based on role
    if (role === ROLE_ADMIN) {
      // Admins can access everything, no redirection needed
      return supabaseResponse;
    }

    if (role === ROLE_AUTHOR) {
      // Check if the current path is allowed for regular users
      const isUserAllowed =
        teacherRoutes.some((route) =>
          request.nextUrl.pathname.startsWith(route)
        ) || request.nextUrl.pathname === '/';

      if (!isUserAllowed) {
        return NextResponse.redirect(new URL('/', request.url)); // Redirect to home
      }
    }

    if (role === ROLE_BANNED || role === ROLE_READER || !role) {
      // Prevent infinite loop for the auth signout route
      if (!request.nextUrl.pathname.startsWith('/api/auth/signout')) {
        const signoutUrl = new URL('/api/auth/signout', request.url);
        // Return an HTML response that automatically submits a POST form
        return new NextResponse(getSignOutFormHtml(signoutUrl.toString()), {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }
    }
  }

  return supabaseResponse;
}
