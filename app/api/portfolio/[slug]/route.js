import { NextResponse } from 'next/server';
import { getPortfolioItemBySlug } from '@/lib/services/portfolioService';

export const GET = async (_request, { params }) => {
  try {
    const { slug } = await params;
    const item = await getPortfolioItemBySlug(slug);

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
