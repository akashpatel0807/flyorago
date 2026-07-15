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
} from 'react-native';
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
  AlertCircle
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function TravellerDashboard() {
  const router = useRouter();
  const { userId, userName } = useAuthStore();

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
        <Text style={styles.headerTitle}>Traveller</Text>
        <Text style={styles.headerGreeting}>Share your extra luggage space and earn money on every flight</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.teal} />}
      >
        {/* Earnings Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <LinearGradient
            colors={[Theme.colors.navy, '#1e293b']}
            style={styles.earningsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.earningsHeaderRow}>
              <View style={styles.earningsIconBg}>
                <Wallet size={20} color={Theme.colors.white} />
              </View>
              <View style={styles.badgeContainer}>
                <TrendingUp size={14} color="#34D399" />
                <Text style={styles.badgeText}>Live Earnings</Text>
              </View>
            </View>
            <Text style={styles.earningsLabel}>Total Potential Earnings</Text>
            <Text style={styles.earningsAmount}>${totalEarnings.toFixed(2)}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.createTripBtn} 
            activeOpacity={0.8}
            onPress={() => router.push('/create-trip')}
          >
            <PlaneTakeoff size={24} color={Theme.colors.white} />
            <Text style={styles.createTripBtnText}>Post a Trip</Text>
            <View style={styles.btnArrow}>
              <ChevronRight size={20} color={Theme.colors.navy} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Trips Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <TouchableOpacity onPress={() => router.push('/all-trips')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.teal} style={{ marginTop: 40 }} />
        ) : recentTrips.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Plane size={40} color={Theme.colors['gray-400']} />
            </View>
            <Text style={styles.emptyTitle}>No Trips Posted</Text>
            <Text style={styles.emptyDesc}>You haven't posted any trips yet. Share your extra luggage space and start earning!</Text>
          </Animated.View>
        ) : (
          recentTrips.map((trip, idx) => (
            <Animated.View key={trip.id || idx} entering={FadeInDown.delay(250 + idx * 50)}>
              <Pressable style={styles.tripCard}>
                <View style={styles.tripHeaderRow}>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{trip.status}</Text>
                  </View>
                  <Text style={styles.priceTag}>${trip.pricePerKg}/kg</Text>
                </View>

                <View style={styles.routeRow}>
                  <Text style={styles.cityText} numberOfLines={1}>{trip.fromCity}</Text>
                  <View style={styles.routeDash} />
                  <PlaneTakeoff size={16} color={Theme.colors.teal} />
                  <View style={styles.routeDash} />
                  <Text style={styles.cityText} numberOfLines={1}>{trip.toCity}</Text>
                </View>

                <View style={styles.footerRow}>
                  <View style={styles.footerItem}>
                    <Calendar size={14} color={Theme.colors['gray-500']} />
                    <Text style={styles.footerItemText}>{formatDate(trip.travelDate)}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Briefcase size={14} color={Theme.colors['gray-500']} />
                    <Text style={styles.footerItemText}>{trip.availableWeight} kg available</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))
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
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: Theme.colors.white,
  },
  headerGreeting: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
    marginTop: 6,
    lineHeight: 20,
  },
  headerTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 26,
    color: Theme.colors.navy,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  earningsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  earningsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  earningsIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: '#34D399',
  },
  earningsLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  earningsAmount: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 36,
    color: Theme.colors.white,
  },
  actionsContainer: {
    marginBottom: 32,
  },
  createTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.teal,
    padding: 20,
    borderRadius: 20,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  createTripBtnText: {
    flex: 1,
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.white,
    marginLeft: 16,
  },
  btnArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  viewAllText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors.teal,
  },
  tripCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    padding: 20,
    marginBottom: 16,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tripHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPill: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: Theme.colors.teal,
  },
  priceTag: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cityText: {
    flex: 1,
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    textAlign: 'center',
  },
  routeDash: {
    width: 30,
    height: 1,
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors['gray-100'],
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerItemText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
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
