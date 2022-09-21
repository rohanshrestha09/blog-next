import { NextRequest, NextResponse } from 'next/server';

const middleware = (request: NextRequest) => {
  const token = request.cookies.get('token');
  if (!token) return NextResponse.rewrite(new URL('/fallback', request.url));
};

export default middleware;

export const config = {
  matcher: ['/blog/create', '/profile'],
};
