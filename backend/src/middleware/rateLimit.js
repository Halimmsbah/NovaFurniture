const windows = new Map();

function getClientKey(req) {
  return req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'anonymous';
}

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, message = 'Too many requests. Please try again later.' } = {}) {
  return (req, res, next) => {
    const key = `${getClientKey(req)}:${req.baseUrl || ''}:${req.path || req.originalUrl || ''}`;
    const now = Date.now();
    const bucket = windows.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    windows.set(key, bucket);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      return res.status(429).json({ message });
    }

    next();
  };
}
