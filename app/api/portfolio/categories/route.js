import { NextResponse } from 'next/server';
import { getCategorySummaries } from '@/lib/services/portfolioService';

export const GET = async () => {
  try {
    const categories = await getCategorySummaries();
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to load portfolio categories.', error: error.message },
      { status: 500 },
    );
  }
};
