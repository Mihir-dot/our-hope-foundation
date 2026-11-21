import { NextResponse, type NextRequest } from 'next/server';

const OPEN = ['/admin/login', '/admin/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (OPEN.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const refresh = request.cookies.get('ohf_refresh')?.value;
  if (!refresh) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
