export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'traveler' | 'sender' | 'both' | 'user';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  isActive: boolean;
  walletBalance?: number;
  escrowBalance?: number;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  fullName: string;
  fromCity: string;
  toCity: string;
  travelDate: string;
  availableWeight: number;
  pricePerKg: number;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface Shipment {
  id: string;
  userId: string;
  fullName: string;
  title: string;
  fromCity: string;
  toCity: string;
  deliveryDeadline: string;
  weight: number;
  pricePaid: number;
  category: 'documents' | 'electronics' | 'clothing' | 'food' | 'other';
  description: string;
  status: 'PENDING' | 'MATCHED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface Match {
  tripId?: string;
  shipmentId?: string;
  tripDetails?: string;
  shipmentDetails?: string;
  matchType: 'shipment_match' | 'traveler_match';
  shipment?: Shipment;
  trip?: Trip;
}

export interface DashboardOverview {
  stats: {
    activeTripsCount: number;
    activeShipmentsCount: number;
    totalShipmentsCount: number;
    totalTripsCount: number;
    completedShipmentsCount: number;
    totalSpend: number;
    walletBalance: number;
    escrowBalance: number;
    pendingCount: number;
    inTransitCount: number;
    outForDeliveryCount: number;
    deliveredCount: number;
  };
  matches: {
    travelMatches: Match[];
    shipmentMatches: Match[];
    totalMatchesCount: number;
  };
  transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  id: string | number;
  userId?: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  createdAt?: string;
}

export interface DBBooking {
  id: string;
  tripId: string;
  shipmentId: string;
  matchedWeight: number;
  totalAmount: number;
  status: 'REQUESTED' | 'ACCEPTED' | 'PAID' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  fromCity: string;
  toCity: string;
  travelDate: string;
  travelerName: string;
  senderName: string;
  createdAt: string;
}

export interface DBReview {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  revieweeName: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
}

export interface ContactMessageEntry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  userType: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: 'national_id' | 'passport' | 'drivers_license';
  frontImage: string;
  backImage?: string;
  selfieImage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  rejectionReason?: string;
  submittedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}
