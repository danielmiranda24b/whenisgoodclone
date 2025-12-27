import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createEvent } from './lib/storage';
import { insertEventSchema } from './lib/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log('[events.ts] Creating event:', req.body);

      if (!process.env.DATABASE_URL) {
        console.error('[events.ts] ERROR: DATABASE_URL environment variable is not set');
        return res.status(500).json({
          error: 'Server configuration error: DATABASE_URL not configured'
        });
      }

      const validatedData = insertEventSchema.parse(req.body);
      const event = await createEvent(validatedData);

      console.log('[events.ts] Event created successfully:', event.id);

      return res.status(200).json(event);
    } catch (error: any) {
      console.error('[events.ts] Error creating event:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
      });

      return res.status(400).json({
        error: error.message || 'Failed to create event',
        detail: error.detail || 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
