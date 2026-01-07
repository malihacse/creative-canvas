#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Setting up Creative Canvas database...\n');

  // Database configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  const dbName = process.env.DB_NAME || 'creative_canvas';

  try {
    // Connect without specifying database
    console.log('📡 Connecting to MySQL server...');
    const connection = await mysql.createConnection(dbConfig);

    // Create database if it doesn't exist
    console.log(`📝 Creating database '${dbName}' if it doesn't exist...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

    // Switch to the database
    await connection.execute(`USE \`${dbName}\`;`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    console.log('📋 Executing database schema...');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement.trim());
      }
    }

    await connection.end();

    console.log('✅ Database setup completed successfully!');
    console.log(`📊 Database: ${dbName}`);
    console.log('🔧 Tables created: users, projects, project_images');
    console.log('🎯 Ready to run the application!\n');

  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure MySQL is running and your connection details are correct.');
      console.log('   Check your .env file or environment variables.');
    }

    process.exit(1);
  }
}

// Check if environment file exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating from template...');
  const exampleEnvPath = path.join(__dirname, '../env.example');
  if (fs.existsSync(exampleEnvPath)) {
    fs.copyFileSync(exampleEnvPath, envPath);
    console.log('📄 Created .env file from env.example');
    console.log('✏️  Please edit .env with your database credentials before running setup again.\n');
    process.exit(0);
  }
}

// Run setup
setupDatabase();
