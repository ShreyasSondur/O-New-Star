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

    // Validate connection string format
    if (!connectionString.startsWith("postgres://") && !connectionString.startsWith("postgresql://")) {
      console.error("[v0] Invalid DATABASE_URL format. Must start with postgres:// or postgresql://")
      throw new Error("Invalid DATABASE_URL format. Must start with postgres:// or postgresql://")
    }

    console.log("[v0] Initializing database connection pool")
    console.log("[v0] Connection string format:", connectionString.substring(0, 30) + "...")
    
    try {
      pool = new Pool({
        connectionString,
        // Add connection options for better compatibility
        max: 1, // Limit connections for serverless
      })
    } catch (error: any) {
      console.error("[v0] Failed to create database pool:", error.message || error)
      throw new Error(`Failed to initialize database connection: ${error.message || "Unknown error"}`)
    }
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
  } catch (error: any) {
    // Better error logging
    const errorMessage = error?.message || String(error)
    const errorCode = error?.code || "UNKNOWN"
    
    console.error("[v0] Database query error:")
    console.error("  - Message:", errorMessage)
    console.error("  - Code:", errorCode)
    console.error("  - Query:", text.substring(0, 200))
    
    // Provide helpful error messages
    if (errorCode === "ECONNREFUSED" || errorMessage.includes("Connection refused")) {
      throw new Error("Cannot connect to database. Check your DATABASE_URL and ensure the database is running.")
    } else if (errorCode === "28P01" || errorMessage.includes("password authentication failed")) {
      throw new Error("Database authentication failed. Check your password in DATABASE_URL.")
    } else if (errorMessage.includes("SSL") || errorMessage.includes("sslmode")) {
      throw new Error("SSL connection error. Make sure your DATABASE_URL includes ?sslmode=require")
    } else if (errorCode === "42P01" || errorMessage.includes("does not exist")) {
      throw new Error("Table does not exist. Run the SQL schema script (001_initial_schema.sql) first.")
    }
    
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
