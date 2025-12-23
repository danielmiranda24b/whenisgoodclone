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
      const validatedData = insertResponseSchema.parse({
        ...req.body,
        eventId: id as string,
      });
      const response = await createResponse(validatedData);
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
