import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV 

const envPath = {
    development: ".env.development",
    production: ".env.production",
}

config({ path: resolve(`config/${envPath[NODE_ENV]}`) })

export const PORT = +process.env.PORT
export const DB_URI = process.env.DB_URI
export const REDIS_URI = process.env.REDIS_URI
export const ACCESS_TOKEN_SIGNITURE = process.env.ACCESS_TOKEN_SIGNITURE
export const ENCRYPTION_KEY1 = process.env.ENCRYPTION_KEY1
export const EMAIL = process.env.EMAIL
export const PASSWORD = process.env.PASSWORD
export const AUDIANCE = process.env.AUDIANCED
export const REFRESH_TOKEN_SIGNITURE = process.env.REFRESH_TOKEN_SIGNITURE
export const EXPIRATIONDATE = process.env.EXPIRATIONDATE
export const ALLOW_ORIGINS = process.env.ALLOW_ORIGINS.split( "," )||[]