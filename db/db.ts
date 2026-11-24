import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations as appRelations } from "@/db/relations";

const connectionString = new URL(process.env.DATABASE_URL!);
connectionString.searchParams.set("sslmode", "verify-full");

const pool = new Pool({
  connectionString: connectionString.toString(),
});

export const db = drizzle({
  client: pool,
  relations: { ...appRelations },
});
