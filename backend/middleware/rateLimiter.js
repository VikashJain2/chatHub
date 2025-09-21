import { redisClient } from "../config/redis.js";

const rateLimiter = (limit = 5, windowInSecond = 60) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
    //   console.log(req.user)
      const key = `rate_limit:${userId}`;
      const current = await redisClient.get(key);
      if (current && parseInt(current) >= limit) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      if (current) {
        await redisClient.incr(key);
      } else {
        await redisClient.set(key, 1, { EX: windowInSecond });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      // Fail-safe: allow requests if Redis is down
      next();
    }
  };
};

export default rateLimiter;