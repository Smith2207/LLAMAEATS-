import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Cliente de solo-lectura/CRUD simple para el adapter de Auth.js. Usa
// `neon-http` (fetch, compatible con Edge runtime) a propósito: las
// operaciones del adapter (usuarios/cuentas/sesiones) nunca necesitan
// `db.transaction()`, así que puede vivir en el middleware sin arrastrar
// el driver `Pool` (que exige runtime Node.js) hasta ahí.
const sql = neon(process.env.DATABASE_URL!);

export const authDb = drizzle(sql, { schema });
