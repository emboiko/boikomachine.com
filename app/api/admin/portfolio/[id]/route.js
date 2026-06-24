import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import {
  deletePortfolioItem,
  getPortfolioItemById,
  updatePortfolioItem,
} from '@/lib/services/portfolioService';
import { portfolioItemUpdateSchema } from '@/lib/validation/portfolio';

const requireAdminSession = async (request) => {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return null;
  }

  return session;
};

export const GET = async (request, { params }) => {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const item = await getPortfolioItemById(id);

    if (!item) {
      return NextResponse.json({ message: 'Portfolio item not found.' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to load portfolio item.', error: error.message },
      { status: 500 },
    );
  }
};

export const PATCH = async (request, { params }) => {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = portfolioItemUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid portfolio item.', errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const item = await updatePortfolioItem(id, parsed.data);

    if (!item) {
      return NextResponse.json({ message: 'Portfolio item not found.' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A portfolio item with this slug already exists.' }, { status: 409 });
    }

    return NextResponse.json(
      { message: 'Failed to update portfolio item.', error: error.message },
      { status: 500 },
    );
  }
};

export const DELETE = async (request, { params }) => {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deletePortfolioItem(id);

    if (!deleted) {
      return NextResponse.json({ message: 'Portfolio item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete portfolio item.', error: error.message },
      { status: 500 },
    );
  }
};
