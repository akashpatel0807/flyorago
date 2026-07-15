import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, MapPin, Navigation, Clock, Calendar, ShieldCheck, Package, Users, HandCoins, Box } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { apiClient } from '../services/apiClient';

const { width } = Dimensions.get('window');

export default function ActiveTripDetailsScreen() {
  const router = useRouter();
  const { id, fromCity, toCity, travelDate, availableWeight, pricePerKg } = useLocalSearchParams();
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        if (id) {
          const res = await apiClient.get(`/api/dashboard/trips/${id}/bookings`);
          if (res.data && res.data.success) {
            setPackages(res.data.data.filter((b: any) => b.status === 'ACCEPTED'));
          }
        }
      } catch (err) {
        console.error('Failed to load packages', err);
      }
    };
    fetchPackages();
  }, [id]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Map Placeholder */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Live Tracking Map View</Text>
        </Animated.View>

        {/* Status Card */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statusCard}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>ONGOING</Text>
          </View>
          <Text style={styles.statusTitle}>Arriving in 2h 45m</Text>
          
          {/* Progress Timeline */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelinePoint}>
              <View style={[styles.dot, styles.activeDot]} />
              <Text style={styles.timelinePointText}>Ahmedabad</Text>
            </View>
            <View style={[styles.timelineLine, styles.activeLine]} />
            <View style={styles.timelinePoint}>
              <View style={[styles.dot, styles.activeDot]} />
              <Text style={styles.timelinePointText}>In Transit</Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelinePoint}>
              <View style={styles.dot} />
              <Text style={styles.timelinePointText}>Mumbai</Text>
            </View>
          </View>
        </Animated.View>

        {/* Flight & Dates */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trip Information</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Clock size={18} color={Theme.colors['gray-500']} />
              <View>
                <Text style={styles.infoLabel}>Departure</Text>
                <Text style={styles.infoValue}>10:30 AM</Text>
              </View>
            </View>
            <View style={styles.infoCol}>
              <Calendar size={18} color={Theme.colors['gray-500']} />
              <View>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{travelDate ? new Date(travelDate as string).toLocaleDateString() : 'Unknown Date'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Capacity & Earnings Info */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trip Capacity & Earnings</Text>
          
          <View style={styles.packageRow}>
            <View style={styles.packageIcon}>
              <Package size={24} color={Theme.colors.teal} />
            </View>
            <View style={styles.packageInfo}>
              <Text style={styles.packageName}>Available Capacity</Text>
              <Text style={styles.packageWeight}>15 kg / 20 kg Left</Text>
            </View>
            <ShieldCheck size={24} color={Theme.colors.teal} />
          </View>

          <View style={[styles.packageRow, { marginTop: 12, backgroundColor: '#FFF7ED' }]}>
            <View style={[styles.packageIcon, { backgroundColor: '#FFEDD5' }]}>
              <HandCoins size={24} color="#EA580C" />
            </View>
            <View style={styles.packageInfo}>
              <Text style={styles.packageName}>Expected Earnings</Text>
              <Text style={[styles.packageWeight, { color: '#EA580C', fontFamily: Theme.typography.h3.fontFamily }]}>$ 150.00</Text>
            </View>
          </View>
        </Animated.View>

        {/* Accepted Packages Section */}
        {packages.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Accepted Packages</Text>
            {packages.map((pkg, idx) => (
              <View key={pkg.id} style={styles.packageItemRow}>
                <View style={styles.packageIconSmall}>
                  <Box size={20} color={Theme.colors.teal} />
                </View>
                <View style={styles.packageInfoSmall}>
                  <Text style={styles.packageTitleSmall}>{pkg.title}</Text>
                  <Text style={styles.packageDetailSmall}>{pkg.weight} kg • from {pkg.senderName}</Text>
                </View>
                <Text style={styles.packagePriceSmall}>${pkg.totalAmount}</Text>
              </View>
            ))}
          </Animated.View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#D1EAE6',
    borderRadius: Theme.borderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Theme.colors.white,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  mapText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.teal,
  },
  statusCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    padding: 20,
    marginBottom: 20,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 10,
    color: '#EF4444',
  },
  statusTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 22,
    color: Theme.colors.navy,
    marginBottom: 24,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 10,
  },
  timelinePoint: {
    alignItems: 'center',
    zIndex: 2,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors['gray-200'],
    borderWidth: 3,
    borderColor: Theme.colors.white,
    marginBottom: 8,
  },
  activeDot: {
    backgroundColor: Theme.colors.teal,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  timelinePointText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: Theme.colors.navy,
  },
  timelineLine: {
    position: 'absolute',
    top: 6,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: Theme.colors['gray-200'],
    zIndex: 1,
  },
  activeLine: {
    backgroundColor: Theme.colors.teal,
    right: '50%', // Fill halfway
  },
  detailsCard: {
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
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontFamily: Theme.typography.bodySmall.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
  },
  infoValue: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
  },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 16,
  },
  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  packageWeight: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.navy,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  contactBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
    marginLeft: 8,
  },
  packageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-100'],
  },
  packageIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageInfoSmall: {
    flex: 1,
  },
  packageTitleSmall: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  packageDetailSmall: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
  },
  packagePriceSmall: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 16,
    color: Theme.colors.teal,
  }
});
