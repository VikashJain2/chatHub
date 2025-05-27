// config/redis.js
import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  } catch (err) {
    console.error('❌ Redis failed to connect:', err);
  }
};

connectRedis();

export { redisClient };
