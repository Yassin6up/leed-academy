import pkg from 'pg';
const { Pool } = pkg;

// Fix: Use named import for drizzle
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from "@shared/schema";

// const DATABASE_URL = "postgres://koyeb-adm:npg_Ad29RfkzIsiC@ep-green-math-a2tuolc5.eu-central-1.pg.koyeb.app/koyebdb?sslmode=require";

// Create a Postgres pool
export const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_1SQTJadUneM8@ep-damp-breeze-a9jpfuuz-pooler.gwc.azure.neon.tech/neondb?sslmode=require",
});

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool, {
  schema,
  logger: true, // simplified logger
});
