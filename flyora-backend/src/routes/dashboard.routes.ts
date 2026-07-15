import { Router } from 'express';
import {
  createTrip,
  getUserTrips,
  searchTrips,
  updateTrip,
  deleteTrip,
  createShipment,
  getUserShipments,
  updateShipment,
  deleteShipment,
  getDashboardOverview,
  updateUserProfile,
  topupWallet,
  getUserNotifications,
  markNotificationRead,
  createBookingRequest,
  acceptBookingRequest,
  getTripBookings,
  getShipmentBookings
} from '../controllers/dashboard.controller';

const router = Router();

router.post('/trips', createTrip);
router.get('/trips/search', searchTrips);
router.get('/trips/:userId', getUserTrips);
router.put('/trips/:id', updateTrip);
router.delete('/trips/:id', deleteTrip);

router.post('/shipments', createShipment);
router.get('/shipments/:userId', getUserShipments);
router.put('/shipments/:id', updateShipment);
router.delete('/shipments/:id', deleteShipment);

router.get('/overview/:userId', getDashboardOverview);
router.put('/profile/:userId', updateUserProfile);
router.post('/wallet/topup', topupWallet);
router.get('/notifications/:userId', getUserNotifications);
router.post('/notifications/mark-read', markNotificationRead);

// ─── Bookings (Matches) ──────────────────────────────────────────────────────
router.post('/bookings', createBookingRequest);
router.put('/bookings/:id/accept', acceptBookingRequest);
router.get('/trips/:tripId/bookings', getTripBookings);
router.get('/shipments/:shipmentId/bookings', getShipmentBookings);

export default router;
