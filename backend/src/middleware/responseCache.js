const responseCacheStore = new Map();

function makeCacheKey(req) {
  return `${req.method}:${req.originalUrl}`;
}

export function cacheResponse(ttlMs = 60 * 1000) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = makeCacheKey(req);
    const cached = responseCacheStore.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(cached.statusCode).json(cached.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      responseCacheStore.set(key, {
        statusCode: res.statusCode,
        body,
        expiresAt: Date.now() + ttlMs,
      });
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

export function invalidateCache(prefixes = []) {
  for (const key of responseCacheStore.keys()) {
    if (prefixes.some((prefix) => key.includes(prefix))) {
      responseCacheStore.delete(key);
    }
  }
}
