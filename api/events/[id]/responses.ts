import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createResponse } from '../../lib/storage';
import { insertResponseSchema } from '../../lib/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (req.method === 'POST') {
    try {
      // Log the incoming request for debugging
      console.log('[responses.ts] Received POST request:', {
        eventId: id,
        body: req.body,
      });

      // Validate environment variables
      if (!process.env.DATABASE_URL) {
        console.error('[responses.ts] ERROR: DATABASE_URL environment variable is not set');
        return res.status(500).json({
          error: 'Server configuration error: DATABASE_URL not configured'
        });
      }

      const validatedData = insertResponseSchema.parse({
        ...req.body,
        eventId: id as string,
      });

      console.log('[responses.ts] Validated data:', validatedData);

      const response = await createResponse(validatedData);

      console.log('[responses.ts] Response created successfully:', response.id);

      return res.status(200).json(response);
    } catch (error: any) {
      // Enhanced error logging
      console.error('[responses.ts] Error submitting response:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
        eventId: id,
        body: req.body,
      });

      // Return detailed error message to client
      return res.status(400).json({
        error: error.message || 'Failed to submit response',
        detail: error.detail || 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
