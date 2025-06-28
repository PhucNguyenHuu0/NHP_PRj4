const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendEmail } = require('../services/emailService');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { nhp_username, nhp_password, nhp_role, nhp_name, nhp_email, nhp_phone, nhp_department } = req.body;
    if (!nhp_username || !nhp_password || !nhp_role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }
    const hashedPassword = await bcrypt.hash(nhp_password, 10);
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;
    const [result] = await db.query(
      'INSERT INTO nhp_users (nhp_username, nhp_password, nhp_role, nhp_name, nhp_email, nhp_phone, nhp_department, nhp_createdAt, nhp_updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nhp_username, hashedPassword, nhp_role, nhp_name, nhp_email, nhp_phone, nhp_department, createdAt, updatedAt]
    );
    res.status(201).json({ message: 'User registered', userId: result.insertId });
  } catch (err) {
    res.status(400).json({ error: 'Failed to register user' });
  }
};

const login = async (req, res) => {
  try {
    const { nhp_username, nhp_password } = req.body;
    if (!nhp_username || !nhp_password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const [users] = await db.query('SELECT * FROM nhp_users WHERE nhp_username = ?', [nhp_username]);
    const user = users[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(nhp_password, user.nhp_password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.nhp_id, role: user.nhp_role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.nhp_role, name: user.nhp_name, email: user.nhp_email });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { nhp_email } = req.body;
    const [users] = await db.query('SELECT * FROM nhp_users WHERE nhp_email = ?', [nhp_email]);
    const user = users[0];
    if (!user) return res.status(400).json({ error: 'Email not found' });

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query('UPDATE nhp_users SET nhp_password = ?, nhp_updatedAt = ? WHERE nhp_email = ?', [hashedPassword, updatedAt, nhp_email]);

    await sendEmail(nhp_email, 'Password Reset', `Your new password is: ${newPassword}`);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = { register, login, resetPassword };