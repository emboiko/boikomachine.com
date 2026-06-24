import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export const POST = async () => {
  const response = NextResponse.json({ message: 'Signed out.' });

  return clearSessionCookie(response);
};
