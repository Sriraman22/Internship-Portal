import pool from "../db.js";

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(20) DEFAULT 'student'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT,
      company_name VARCHAR(100),
      position VARCHAR(100),
      start_date DATE,
      end_date DATE,
      coordinator_status VARCHAR(20) DEFAULT 'pending',
      hod_status VARCHAR(20) DEFAULT 'pending',
      admin_status VARCHAR(20) DEFAULT 'pending',
      FOREIGN KEY (student_id) REFERENCES Users(id)
    )
  `);

  console.log("✅ DB schema ready");
  process.exit();
}

init();
