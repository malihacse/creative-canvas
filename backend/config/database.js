const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'creative_canvas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let connectionPool;

async function getConnection() {
  if (!connectionPool) {
    try {
      connectionPool = mysql.createPool(dbConfig);
      console.log('Database connection pool created successfully');
    } catch (error) {
      console.error('Error creating database connection pool:', error);
      throw error;
    }
  }
  return connectionPool;
}

async function testConnection() {
  try {
    const pool = await getConnection();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

module.exports = {
  getConnection,
  testConnection
};
