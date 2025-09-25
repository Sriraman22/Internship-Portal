// backend/db.js
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config(); // make sure .env is loaded

const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,   // 👈 must not be undefined
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true, // required for Azure SQL
    trustServerCertificate: false
  }
};

let pool;

export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export { sql };
