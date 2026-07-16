import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380 || height < 700;
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import {
  PlaneTakeoff,
  Wallet,
  TrendingUp,
  ChevronRight,
  Plane,
  Calendar,
  Briefcase,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function TravellerDashboard() {
  const router = useRouter();
  const { userId } = useAuthStore();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = async () => {
    if (!userId) return;
    try {
      const response = await apiClient.get(`/api/dashboard/trips/${userId}`);
      if (response.data && response.data.success) {
        setTrips(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [userId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  // Calculate total potential earnings from active/all trips
  const totalEarnings = useMemo(() => {
    return trips.reduce((sum, trip) => sum + (Number(trip.availableWeight) * Number(trip.pricePerKg)), 0);
  }, [trips]);

  const recentTrips = useMemo(() => {
    return trips.slice(0, 3);
  }, [trips]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Traveller</Text>
          <Text style={styles.headerSubtitle}>Share your extra luggage space and earn on every flight</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.teal} />}
      >
        {/* Earnings Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.earningsCardContainer}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.earningsCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.earningsHeaderRow}>
              <View style={styles.earningsIconBg}>
                <Wallet size={20} color="#2DD4BF" />
              </View>
              <View style={styles.badgeContainer}>
                <TrendingUp size={14} color="#34D399" />
                <Text style={styles.badgeText}>Live Earnings</Text>
              </View>
            </View>
            <Text style={styles.earningsLabel}>Total Potential Earnings</Text>
            <Text style={styles.earningsAmount}>₹{totalEarnings.toLocaleString('en-IN')}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Action Button: Post a Trip */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.postTripBtnContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.postTripPressable,
              pressed && styles.buttonPressedEffect
            ]}
            onPress={() => router.push('/create-trip')}
          >
            <LinearGradient
              colors={['#0D9488', '#0F766E']}
              style={styles.postTripGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.postTripContent}>
                <PlaneTakeoff size={22} color={Theme.colors.white} />
                <Text style={styles.postTripText}>Post a New Trip</Text>
                <View style={styles.postTripArrowCircle}>
                  <ChevronRight size={16} color={Theme.colors.teal} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Recent Trips Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <TouchableOpacity onPress={() => router.push('/all-trips')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.teal} style={{ marginTop: 40 }} />
        ) : recentTrips.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Plane size={48} color={Theme.colors['gray-300']} />
            </View>
            <Text style={styles.emptyTitle}>No Trips Posted</Text>
            <Text style={styles.emptyDesc}>You haven't posted any trips yet. Share your extra luggage space and start earning!</Text>
          </Animated.View>
        ) : (
          recentTrips.map((trip, idx) => {
            const status = (trip.status || 'ACTIVE').toUpperCase();
            let statusBg = '#EFF6FF';
            let statusText = '#1E40AF';
            if (status === 'ACTIVE' || status === 'COMPLETED' || status === 'APPROVED') {
              statusBg = '#D1FAE5';
              statusText = '#065F46';
            } else if (status === 'CANCELLED' || status === 'REJECTED') {
              statusBg = '#FEE2E2';
              statusText = '#991B1B';
            }
            
            return (
              <Animated.View key={trip.id || idx} entering={FadeInDown.delay(200 + idx * 50)}>
                <Pressable 
                  style={({ pressed }) => [
                    styles.tripCard,
                    pressed && styles.cardPressedEffect
                  ]}
                  onPress={() => router.push({ pathname: '/active-trip-details', params: { tripId: trip.id } })}
                >
                  <View style={styles.tripHeaderRow}>
                    <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusText, { color: statusText }]}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </Text>
                    </View>
                    <Text style={styles.priceTag}>₹{Number(trip.pricePerKg).toLocaleString('en-IN')}/kg</Text>
                  </View>

                  <View style={styles.routeRow}>
                    <Text style={styles.cityText} numberOfLines={1}>{trip.fromCity || 'Ahmedabad'}</Text>
                    <View style={styles.routeTimeline}>
                      <View style={styles.timelineDot} />
                      <View style={styles.timelineLine} />
                      <Plane size={14} color={Theme.colors.teal} style={styles.timelinePlane} />
                      <View style={styles.timelineLine} />
                      <View style={styles.timelineDot} />
                    </View>
                    <Text style={styles.cityText} numberOfLines={1}>{trip.toCity || 'Mumbai'}</Text>
                  </View>

                  <View style={styles.footerRow}>
                    <View style={styles.footerItem}>
                      <View style={styles.footerIconBox}>
                        <Calendar size={12} color={Theme.colors.teal} />
                      </View>
                      <Text style={styles.footerItemText}>{formatDate(trip.travelDate)}</Text>
                    </View>
                    <View style={styles.footerItem}>
                      <View style={styles.footerIconBox}>
                        <Briefcase size={12} color={Theme.colors.teal} />
                      </View>
                      <Text style={styles.footerItemText}>{trip.availableWeight} kg left</Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#F7FBFA',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: isSmallScreen ? 20 : 24,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: isSmallScreen ? 12 : 14,
    color: Theme.colors['gray-500'],
  },
  scrollContent: {
    paddingBottom: 120, // space for tab bar
  },
  earningsCardContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  earningsCardGradient: {
    padding: isSmallScreen ? 18 : 24,
  },
  earningsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 10,
    color: '#34D399',
    fontWeight: '700',
  },
  earningsLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  earningsAmount: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: isSmallScreen ? 28 : 34,
    color: Theme.colors.white,
    fontWeight: '800',
  },
  postTripBtnContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  postTripPressable: {
    width: '100%',
  },
  postTripGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  postTripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTripText: {
    flex: 1,
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
    fontWeight: '800',
    marginLeft: 12,
  },
  postTripArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressedEffect: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardPressedEffect: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.navy,
  },
  viewAllText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors.teal,
    fontWeight: '700',
  },
  tripCard: {
    backgroundColor: Theme.colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.05)',
  },
  tripHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  priceTag: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 16,
    color: Theme.colors.teal,
    fontWeight: '800',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  cityText: {
    flex: 1,
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
    fontWeight: '800',
    textAlign: 'center',
  },
  routeTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors['gray-300'],
  },
  timelineLine: {
    flex: 1,
    height: 1,
    borderWidth: 0.5,
    borderColor: Theme.colors['gray-200'],
    borderStyle: 'dashed',
  },
  timelinePlane: {
    marginHorizontal: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.05)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerItemText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-500'],
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors['gray-100'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
