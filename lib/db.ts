import { Pool } from "@neondatabase/serverless"

// Create a singleton connection pool
let pool: Pool | null = null

export function getDb() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error("[v0] DATABASE_URL environment variable is not set. Please add it in the Vars section.")
      throw new Error("DATABASE_URL environment variable is not set. Please add it in the Vars section.")
    }

    console.log("[v0] Initializing database connection pool")
    pool = new Pool({
      connectionString,
    })
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const db = getDb()
  try {
    console.log("[v0] Executing query:", text.substring(0, 100))
    const result = await db.query(text, params)
    console.log("[v0] Query successful, rows returned:", result.rows.length)
    return result
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const db = getDb()
  const client = await db.connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("[v0] Transaction error:", error)
    throw error
  } finally {
    client.release()
  }
}
