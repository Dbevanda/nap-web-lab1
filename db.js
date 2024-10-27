const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY,
      vatin VARCHAR(50) NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("Table 'tickets' is ready.");
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

module.exports = { pool, createTable };
