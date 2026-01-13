import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/jobseeker/dashboard',
  '/jobseeker/create-profile',
  '/jobseeker/interviews',
  '/jobseeker/settings',
  '/employer/dashboard',
  '/employer/profile',
  '/employer/company/details',
  '/employer/individual/details',
  '/employer/company/edit-profile',
  '/employer/individual/edit-profile',
  '/employer/interviews',
  '/employer/saved-cvs',
  '/messages',
  '/invite',
  '/cv',
  '/report',
  '/admin',
]

// Routes that should redirect logged-in users away
const authRoutes = [
  '/login',
  '/jobseeker/signup',
  '/employer/company/create-account',
  '/employer/individual/create-account',
]

// Role-specific routes
const jobseekerRoutes = [
  '/jobseeker/dashboard',
  '/jobseeker/create-profile',
  '/jobseeker/interviews',
  '/jobseeker/settings',
]

const employerRoutes = [
  '/employer/dashboard',
  '/employer/profile',
  '/employer/company/details',
  '/employer/individual/details',
  '/employer/company/edit-profile',
  '/employer/individual/edit-profile',
  '/employer/interviews',
  '/employer/saved-cvs',
]

// Admin-only routes
const adminRoutes = [
  '/admin',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, let the app handle it (will show error)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Missing Supabase environment variables')
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session if needed
  const { data: { user }, error } = await supabase.auth.getUser()

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname === route)
  const isJobseekerRoute = jobseekerRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isEmployerRoute = employerRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Handle unauthenticated users trying to access protected routes
  if (isProtectedRoute && (!user || error)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)

    // For jobseeker routes, redirect to jobseeker signup
    if (isJobseekerRoute) {
      return NextResponse.redirect(new URL('/jobseeker/signup', request.url))
    }

    // For employer routes, redirect to employer page
    if (isEmployerRoute) {
      return NextResponse.redirect(new URL('/employer', request.url))
    }

    // For admin routes, redirect to login
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.redirect(redirectUrl)
  }

  // Handle authenticated users trying to access auth routes
  if (isAuthRoute && user && !error) {
    // Query database for role - this is the SINGLE source of truth
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userData?.role as string | undefined

    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else if (role === 'jobseeker') {
      return NextResponse.redirect(new URL('/jobseeker/dashboard', request.url))
    } else if (role === 'employer') {
      return NextResponse.redirect(new URL('/employer/dashboard', request.url))
    }

    // Default redirect for logged-in users
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Role-based access control for authenticated users (jobseeker/employer only)
  // Admin route access is handled by app/admin/layout.tsx via DB query
  if (user && !error && !isAdminRoute) {
    // Query database for role - this is the SINGLE source of truth
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userData?.role as string | undefined

    // Prevent jobseekers from accessing employer routes
    if (role === 'jobseeker' && isEmployerRoute) {
      return NextResponse.redirect(new URL('/jobseeker/dashboard', request.url))
    }

    // Prevent employers from accessing jobseeker routes
    if (role === 'employer' && isJobseekerRoute) {
      return NextResponse.redirect(new URL('/employer/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
