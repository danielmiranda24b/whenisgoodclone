import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEventWithResponses } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
      const eventWithResponses = await getEventWithResponses(id as string);
      if (!eventWithResponses) {
        return res.status(404).json({ error: 'Event not found' });
      }
      return res.status(200).json(eventWithResponses);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
