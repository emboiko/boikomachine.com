import { connectToDatabase } from '@/lib/db/mongoose';
import { AnalyticsEvent } from '@/lib/models/AnalyticsEvent';

export const recordAnalyticsEvent = async (eventData) => {
  await connectToDatabase();

  const event = await AnalyticsEvent.create({
    type: eventData.type,
    path: eventData.path,
    metadata: eventData.metadata,
    sessionId: eventData.sessionId,
  });

  return {
    id: event._id.toString(),
    type: event.type,
    path: event.path,
  };
};
