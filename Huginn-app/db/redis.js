import { createClient } from 'redis';



export const createRedisClient = async() => {

  const redisClient = createClient({
     url: `redis://${process.env.REDIS_HOST}:${+(process.env.REDIS_PORT)}`
  });

  redisClient.on('error', err => console.log('Redis Client Error', err));

  await redisClient.connect();

  return redisClient
}
