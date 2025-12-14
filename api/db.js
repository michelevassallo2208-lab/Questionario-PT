const mysql = require('mysql2/promise');

// Create a connection pool to manage connections efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
      rejectUnauthorized: false // Often needed for hosted DBs like PlanetScale or Azure, remove if plain http
  }
});

module.exports = pool;