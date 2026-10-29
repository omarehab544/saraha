import { createClient } from "redis"
import { REDIS_URI } from "../../config/config.service.js";

export const redis_client = createClient({
  url: REDIS_URI
});

const  connectRedis= async () => {
  try {
   await redis_client.connect();
    console.log("Redis Connected");
  } catch (error) {
    console.error(`Error: ${error.message}`);
   
  }
};

export default connectRedis;