import { Request, Response } from 'express';
import { query } from '../services/db.service';
import { env } from '../config/env';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, userType, subject, message } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'Name is required' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.trim() || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Valid email is required' });
      return;
    }

    if (!userType || typeof userType !== 'string' || !userType.trim()) {
      res.status(400).json({ success: false, message: 'User type is required' });
      return;
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      res.status(400).json({ success: false, message: 'Subject is required' });
      return;
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const insertQuery = `
      INSERT INTO contact_messages (name, email, phone, user_type, subject, message)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, created_at
    `;

    const result = await query(insertQuery, [
      name.trim(),
      email.toLowerCase().trim(),
      phone ? phone.trim() : null,
      userType.trim(),
      subject.trim(),
      message.trim(),
    ]);

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully! We will get back to you soon.',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
      version: env.apiVersion,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error submitting contact message',
      error: error.message,
    });
  }
};
