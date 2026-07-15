import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Modal, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, Box, CheckCircle2, ChevronRight, Clock, MapPin, Navigation, Package, Receipt, Truck, X, User } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { apiClient } from '../services/apiClient';

const { width } = Dimensions.get('window');

export default function PackageDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  // Parse shipment details passed via route params
  let shipment: any = null;
  if (params.shipment) {
    try {
      shipment = JSON.parse(params.shipment as string);
    } catch (e) {
      console.log('Error parsing shipment param', e);
    }
  }

  const trackingNumber = shipment?.id ? shipment.id.substring(0, 10).toUpperCase() : 'FLY123456789';
  const deliveryDate = shipment?.deliveryDeadline || 'Oct 20, 2026';
  const fromCity = shipment?.fromCity || 'Mumbai';
  const toCity = shipment?.toCity || 'New York';
  const category = shipment?.category || 'Documents';
  const weight = shipment?.weight || '1.2';
  const value = shipment?.pricePaid || '0.00';
  const images = shipment?.images && shipment.images.length > 0 ? shipment.images : [
    'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=400&q=80'
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (shipment?.id) {
          const res = await apiClient.get(`/api/dashboard/shipments/${shipment.id}/bookings`);
          if (res.data && res.data.success) {
            setRequests(res.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching shipment requests:', error);
      }
    };
    fetchRequests();
  }, [shipment?.id]);

  const handleAcceptRequest = async (bookingId: string) => {
    try {
      await apiClient.put(`/api/dashboard/bookings/${bookingId}/accept`);
      Alert.alert('Success', 'Traveller request accepted!');
      setRequests((prev) => prev.map((r) => r.id === bookingId ? { ...r, status: 'ACCEPTED' } : r));
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Package Details</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Status Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <View>
              <Text style={styles.trackingNumber}>#{trackingNumber}</Text>
              <Text style={styles.expectedDelivery}>Expected: {deliveryDate}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{shipment?.status === 'MATCHED' ? 'Matched' : shipment?.status === 'DELIVERED' ? 'Delivered' : 'Pending'}</Text>
            </View>
          </View>

          <View style={styles.mapVisualPlaceholder}>
            <View style={styles.mapIconBg}>
              <MapPin size={24} color={Theme.colors.teal} />
            </View>
            <View style={styles.mapDash} />
            <View style={[styles.mapIconBg, { backgroundColor: Theme.colors['gray-200'] }]}>
              <Navigation size={24} color={Theme.colors['gray-400']} />
            </View>
          </View>
          <View style={styles.mapTextRow}>
            <Text style={styles.cityText}>{fromCity}</Text>
            <Text style={styles.cityText}>{toCity}</Text>
          </View>
        </Animated.View>

        {/* Tracking Timeline */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Tracking History</Text>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIconContainer}>
              <CheckCircle2 size={20} color={Theme.colors.teal} />
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Package Picked Up</Text>
              <Text style={styles.timelineDate}>Oct 14, 10:30 AM • Ahmedabad</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineIconContainer}>
              <Truck size={20} color={Theme.colors.teal} />
              <View style={[styles.timelineLine, { backgroundColor: Theme.colors['gray-200'] }]} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>In Transit to Destination</Text>
              <Text style={styles.timelineDate}>Oct 15, 02:15 PM • On the way</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineIconContainer}>
              <Box size={20} color={Theme.colors['gray-300']} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: Theme.colors['gray-400'] }]}>Out for Delivery</Text>
              <Text style={styles.timelineDate}>Pending</Text>
            </View>
          </View>
        </Animated.View>

        {/* Item Information */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{category}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{weight} kg</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Value / Price Paid</Text>
              <Text style={styles.infoValue}>$ {value}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>Peer-to-Peer</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          <Text style={styles.infoLabel}>Uploaded Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, marginTop: 8 }}>
            {images.map((img: string, idx: number) => (
              <TouchableOpacity key={idx} onPress={() => setPreviewImage(img)}>
                <Image source={img} style={styles.uploadedImage} contentFit="cover" transition={300} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Payment Summary */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Base Fare</Text>
            <Text style={styles.paymentAmount}>$ {Number(value).toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Taxes & Fees</Text>
            <Text style={styles.paymentAmount}>$ 0.00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>$ {Number(value).toFixed(2)}</Text>
          </View>
        </Animated.View>

        {/* Requests Section */}
        {requests.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.requestsCard}>
            <Text style={styles.sectionTitle}>Traveller Requests</Text>
            {requests.map((req, idx) => (
              <View key={req.id} style={styles.requestItem}>
                <View style={styles.requestHeaderRow}>
                  <View style={styles.requestUser}>
                    <View style={styles.requestAvatar}>
                      <User size={16} color="#FFF" />
                    </View>
                    <Text style={styles.requestUserName}>{req.travellerName || 'Traveller'}</Text>
                  </View>
                  <Text style={[styles.requestStatus, req.status === 'ACCEPTED' && { color: Theme.colors.success }]}>
                    {req.status}
                  </Text>
                </View>
                <View style={styles.requestDetailsRow}>
                  <Text style={styles.requestDetailText}>Route: {req.fromCity} ➔ {req.toCity}</Text>
                </View>
                <View style={styles.requestDetailsRow}>
                  <Text style={styles.requestDetailText}>Travel Date: {new Date(req.travelDate).toLocaleDateString()}</Text>
                  <Text style={styles.requestPriceText}>Asking: ${req.totalAmount}</Text>
                </View>

                {req.status === 'REQUESTED' && (
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptRequest(req.id)}>
                    <Text style={styles.acceptBtnText}>Accept Traveller</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Animated.View>
        )}

      </ScrollView>

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.previewModalOverlay}>
          <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setPreviewImage(null)}>
            <X size={28} color="#FFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image 
              source={previewImage} 
              style={styles.previewImageFull} 
              contentFit="contain" 
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.white,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    padding: 20,
    marginBottom: 20,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  trackingNumber: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 20,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  expectedDelivery: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  liveText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 10,
    color: '#3B82F6',
  },
  mapVisualPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  mapIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapDash: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: Theme.colors.teal,
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  mapTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  cityText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
  },
  timelineCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    padding: 20,
    marginBottom: 20,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIconContainer: {
    alignItems: 'center',
    width: 30,
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Theme.colors.teal,
    marginTop: 4,
    minHeight: 30,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 10,
  },
  timelineTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  timelineDate: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
  },
  infoCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    padding: 20,
    marginBottom: 20,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
  },
  paymentAmount: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors['gray-100'],
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
  },
  totalAmount: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.teal,
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePreviewBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  previewImageFull: {
    width: '100%',
    height: '70%',
  },
  requestsCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    padding: 20,
    marginTop: 20,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  requestItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-100'],
  },
  requestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  requestUserName: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
  },
  requestStatus: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 13,
    color: Theme.colors.warning,
  },
  requestDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  requestDetailText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
  },
  requestPriceText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.teal,
  },
  acceptBtn: {
    marginTop: 12,
    backgroundColor: Theme.colors.teal,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.white,
  }
});
