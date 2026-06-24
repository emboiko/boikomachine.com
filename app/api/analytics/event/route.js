import { NextResponse } from 'next/server';
import { isAnalyticsEnabled } from '@/lib/analytics/isEnabled';
import { recordAnalyticsEvent } from '@/lib/services/analyticsService';
import { analyticsEventSchema } from '@/lib/validation/contact';

export const POST = async (request) => {
  if (!isAnalyticsEnabled()) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const body = await request.json();
    const parsed = analyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid analytics payload.', errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const event = await recordAnalyticsEvent(parsed.data);
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to record analytics event.', error: error.message },
      { status: 500 },
    );
  }
};
