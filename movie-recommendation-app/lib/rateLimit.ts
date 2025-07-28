import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory rate limiter (for production, use Redis or similar)
const requestCounts = new Map<string, number>();

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: {
    windowMs: number;
    max: number;
  }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    const currentCount = requestCounts.get(ip) || 0;

    if (currentCount >= options.max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `You've exceeded the ${options.max} requests limit`
      });
    }

    requestCounts.set(ip, currentCount + 1);
    setTimeout(() => {
      const count = requestCounts.get(ip);
      if (count) requestCounts.set(ip, count - 1);
    }, options.windowMs);

    return handler(req, res);
  };
}