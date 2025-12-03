import pkg from 'pg';
const { Pool } = pkg;

// Fix: Use named import for drizzle
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from "@shared/schema";

// const DATABASE_URL = "postgres://koyeb-adm:npg_Ad29RfkzIsiC@ep-green-math-a2tuolc5.eu-central-1.pg.koyeb.app/koyebdb?sslmode=require";

// Create a Postgres pool
export const pool = new Pool({
  connectionString: "postgres://postgres:1234@localhost:5432/leedaca",
});

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool, {
  schema,
  logger: true, // simplified logger
});
