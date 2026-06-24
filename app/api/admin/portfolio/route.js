import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import {
  createPortfolioItem,
  listAllPortfolioItems,
} from '@/lib/services/portfolioService';
import { portfolioItemCreateSchema } from '@/lib/validation/portfolio';

const requireAdminSession = async (request) => {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return null;
  }

  return session;
};

export const GET = async (request) => {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const items = await listAllPortfolioItems();
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to load portfolio items.', error: error.message },
      { status: 500 },
    );
  }
};

export const POST = async (request) => {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = portfolioItemCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid portfolio item.', errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const item = await createPortfolioItem(parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A portfolio item with this slug already exists.' }, { status: 409 });
    }

    return NextResponse.json(
      { message: 'Failed to create portfolio item.', error: error.message },
      { status: 500 },
    );
  }
};
