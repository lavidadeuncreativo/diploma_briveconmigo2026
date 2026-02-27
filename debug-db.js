const { Pool } = require("pg");

const url = "postgresql://neondb_owner:npg_DTtq2MwXOC5o@ep-tiny-leaf-aij8zeg0-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
    const pool = new Pool({ connectionString: url });

    console.log("--- Checking Event Table ---");
    const eventRes = await pool.query('SELECT * FROM "Event"');
    console.log(eventRes.rows);

    console.log("\n--- Checking Token Table ---");
    const tokenRes = await pool.query('SELECT * FROM "Token"');
    console.log(tokenRes.rows);

    await pool.end();
}

main().catch(console.error);
