import { NextResponse } from 'next/server';
import { getItemsByCategory } from '@/lib/services/portfolioService';
import { portfolioCategoryQuerySchema } from '@/lib/validation/portfolio';

export const GET = async (request) => {
  try {
    const requestUrl = new URL(request.url);
    const category = requestUrl.searchParams.get('category');

    if (!category) {
      return NextResponse.json(
        { message: 'Missing category query parameter.' },
        { status: 400 },
      );
    }

    const parsed = portfolioCategoryQuerySchema.safeParse({ category });

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid category.', errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const items = await getItemsByCategory(parsed.data.category);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to load portfolio items.', error: error.message },
      { status: 500 },
    );
  }
};
