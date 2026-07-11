import { Router } from 'express';
import {
  getAdminStats,
  getUsersList,
  toggleUserStatus,
  getTripsList,
  getBookingsList,
  getReviewsList,
  getWaitlistList,
  getContactsList,
  getShipmentsList,
  adminLogin,
  updateAdminCredentials
} from '../controllers/admin.controller';

const router = Router();

router.get('/stats', getAdminStats);
router.get('/users', getUsersList);
router.put('/users/:id/status', toggleUserStatus);
router.get('/trips', getTripsList);
router.get('/bookings', getBookingsList);
router.get('/reviews', getReviewsList);
router.get('/waitlist', getWaitlistList);
router.get('/contacts', getContactsList);
router.get('/shipments', getShipmentsList);
router.post('/login', adminLogin);
router.post('/update-credentials', updateAdminCredentials);

export default router;
