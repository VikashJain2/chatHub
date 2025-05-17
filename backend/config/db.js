// db.js
import mysql from "mysql2/promise";



const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Default MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verify connection on startup
pool.getConnection()
  .then((connection) => {
    console.log('Successfully connected to MySQL database');
    connection.release();
  })
  .catch((error) => {
    console.error("Error connecting to MySQL database:", error);
    process.exit(1);
  });

export default pool;