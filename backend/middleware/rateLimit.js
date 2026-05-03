function rateLimit({ windowMs, max, message }) {
  const hits = new Map();
  let lastCleanup = Date.now();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;

    if (now - lastCleanup > windowMs) {
      for (const [storedKey, storedRecord] of hits.entries()) {
        if (storedRecord.resetAt <= now) {
          hits.delete(storedKey);
        }
      }

      lastCleanup = now;
    }

    const record = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (record.resetAt <= now) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count += 1;
    hits.set(key, record);

    if (record.count > max) {
      res.setHeader("Retry-After", Math.ceil((record.resetAt - now) / 1000));

      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
}

module.exports = rateLimit;
