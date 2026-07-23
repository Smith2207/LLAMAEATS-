import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Usamos el driver `neon-serverless` (Pool por WebSocket) en vez de
// `neon-http` porque este último NO soporta `db.transaction()`, y la
// reserva de mesa depende de transacciones reales para ser atómica.
// Esto exige runtime Node.js (no Edge) en todo lo que importe este módulo.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
