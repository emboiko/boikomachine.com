import { NextResponse } from 'next/server';
import { getFeaturedPortfolioItems } from '@/lib/services/portfolioService';

export const GET = async () => {
  try {
    const items = await getFeaturedPortfolioItems();
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to load portfolio items.', error: error.message },
      { status: 500 },
    );
  }
};
