import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../services/db.service';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendPasswordResetEmail } from '../services/email.service';
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    res.status(400).json({
      success: false,
      message: 'All fields (fullName, email, phone, password) are required',
    });
    return;
  }

  try {
    const trimmedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingRes = await query(
      'SELECT id FROM users WHERE email = $1',
      [trimmedEmail]
    );

    if (existingRes.rowCount && existingRes.rowCount > 0) {
      res.status(400).json({
        success: false,
        message: 'Email address is already registered',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertRes = await query(
      `INSERT INTO users (full_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email`,
      [fullName.trim(), trimmedEmail, phone.trim(), passwordHash]
    );

    const newUser = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error('[AUTH_ERROR] Error during registration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
    return;
  }

  try {
    const trimmedEmail = email.toLowerCase().trim();

    // Fetch user
    const userRes = await query(
      'SELECT id, full_name, email, role, password_hash FROM users WHERE email = $1 AND is_active = TRUE',
      [trimmedEmail]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
      return;
    }

    const user = userRes.rows[0];

    // Verify password
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
      return;
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[AUTH_ERROR] Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: error.message,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  try {
    const trimmedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userRes = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
    if (userRes.rowCount === 0) {
      // Return 200 to prevent email enumeration attacks
      res.status(200).json({ success: true, message: 'If that email is in our database, we will send a password reset link to it.' });
      return;
    }

    const userId = userRes.rows[0].id;

    // Generate JWT Reset Token (valid for 15 minutes)
    const resetToken = jwt.sign({ userId }, env.jwtSecret, { expiresIn: '15m' });

    // Send email
    await sendPasswordResetEmail(trimmedEmail, resetToken);

    res.status(200).json({
      success: true,
      message: 'If that email is in our database, we will send a password reset link to it.',
    });
  } catch (error: any) {
    console.error('[AUTH_ERROR] Error in forgotPassword:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ success: false, message: 'Token and new password are required' });
    return;
  }

  try {
    // Verify Token
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    
    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, decoded.userId]);

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error: any) {
    console.error('[AUTH_ERROR] Error in resetPassword:', error);
    if (error.name === 'TokenExpiredError') {
      res.status(400).json({ success: false, message: 'Reset link has expired. Please request a new one.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(400).json({ success: false, message: 'Invalid reset link.' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
