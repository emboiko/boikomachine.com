import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdminPassword } from '@/lib/auth/password';
import { appendSessionCookie, createAdminSessionToken } from '@/lib/auth/session';

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
});

export const POST = async (request) => {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid login request.' }, { status: 400 });
    }

    const isValidPassword = await verifyAdminPassword(parsed.data.password);

    if (!isValidPassword) {
      return NextResponse.json({ message: 'Invalid password.' }, { status: 401 });
    }

    const sessionToken = await createAdminSessionToken();
    const response = NextResponse.json({ message: 'Signed in.' });

    return appendSessionCookie(response, sessionToken);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to sign in.' },
      { status: 500 },
    );
  }
};
