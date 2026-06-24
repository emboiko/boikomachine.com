import { connectToDatabase } from '@/lib/db/mongoose';

export const checkDatabaseHealth = async () => {
  await connectToDatabase();
  return { database: 'connected' };
};
