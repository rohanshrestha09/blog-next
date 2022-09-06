import { NextRequest, NextResponse } from 'next/server';

const middleware = (request: NextRequest) => {
  console.log(request.nextUrl.pathname);
};

export default middleware;

export const config = {
  matcher: '/profile',
};
