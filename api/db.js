const mysql = require('mysql2/promise');

// Create a connection pool to manage connections efficiently
// ENV variables must be set in Vercel Dashboard
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  // Limit connections in serverless to prevent exhaustion (many lambdas x 10 connections = error)
  connectionLimit: 1, 
  queueLimit: 0,
  // SSL is often required for cloud databases (PlanetScale, Azure, AWS RDS)
  ssl: {
      rejectUnauthorized: false 
  }
});

module.exports = pool;