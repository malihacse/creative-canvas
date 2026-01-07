const { getConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.created_at = data.created_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Find user by username
  static async findByUsername(username) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Convert to JSON (exclude password hash)
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      created_at: this.created_at
    };
  }
}

module.exports = User;
