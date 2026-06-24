import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/services/healthService';

export const GET = async () => {
  try {
    const health = await checkDatabaseHealth();
    return NextResponse.json({ status: 'ok', ...health });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 503 },
    );
  }
};
