import { Router } from 'express';
import { submitContactMessage } from '../controllers/contact.controller';

const router = Router();

/**
 * @route   POST /api/contact
 * @desc    Submit a contact/support message
 * @access  Public
 */
router.post('/', submitContactMessage);

export default router;
