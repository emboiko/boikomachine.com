import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth/session';

export const GET = async (request) => {
  const session = await getAdminSessionFromRequest(request);

  return NextResponse.json({
    authenticated: Boolean(session),
  });
};
