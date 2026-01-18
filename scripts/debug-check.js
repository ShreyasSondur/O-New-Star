const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log("--- Debugging Environment & DB ---");

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ DATABASE_URL is missing in .env");
        return;
    }
    console.log("✅ DATABASE_URL is found");

    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
        console.error("❌ AUTH_SECRET is missing");
    } else {
        console.log("✅ AUTH_SECRET is found");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId) console.error("❌ GOOGLE_CLIENT_ID is missing");
    else console.log("✅ GOOGLE_CLIENT_ID is found");

    if (!clientSecret) console.error("❌ GOOGLE_CLIENT_SECRET is missing");
    else console.log("✅ GOOGLE_CLIENT_SECRET is found");

    if (clientId === clientSecret) {
        console.error("❌ CRITICAL: GOOGLE_CLIENT_ID matches GOOGLE_CLIENT_SECRET. Login will fail.");
    } else {
        console.log("✅ Client ID and Secret look different.");
    }

    console.log("\nAttempting DB Connection...");
    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });
    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to Database!");
        const res = await client.query('SELECT NOW()');
        console.log("✅ Query Result:", res.rows[0]);
        client.release();
    } catch (err) {
        console.error("❌ Database Connection Failed:", err.message);
    } finally {
        await pool.end();
    }
}

testConnection();
