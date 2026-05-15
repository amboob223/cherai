const { Pool } = require("pg");
require("dotenv").config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // REQUIRED for Render Postgres
  },
});

// test connection (safe version)
pool.query("SELECT NOW()")
  .then(() => console.log("DB connected ✅"))
  .catch(err => console.error("DB connection error ❌", err));

module.exports = pool;