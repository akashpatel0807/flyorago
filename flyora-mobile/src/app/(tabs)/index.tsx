import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import {
  MapPin,
  Bell,
  Search,
  ShieldCheck,
  Lock,
  Clock,
  Headset,
  ChevronDown,
} from 'react-native-workspace/node_modules/lucide-react-native';
// Note: We use lucide-react-native from project root (since it's already installed there)
import {
  ChevronDown as LucideChevronDown,
  MapPin as LucideMapPin,
  Bell as LucideBell,
  Search as LucideSearch,
  ShieldCheck as LucideShieldCheck,
  Lock as LucideLock,
  Clock as LucideClock,
  Headset as LucideHeadset,
  Package as LucidePackage,
  Briefcase as LucideBriefcase,
  PlaneTakeoff as LucidePlaneTakeoff,
  ArrowRight as LucideArrowRight,
  Activity as LucideActivity,
  Star as LucideStar,
  Navigation as LucideNavigation,
  CheckCircle2 as LucideCheckCircle2,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInRight, FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380 || height < 700;

import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const router = useRouter();
  const { userId, userName } = useAuthStore();
  const [locationText, setLocationText] = useState('Detecting location...');
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [trendingTrips, setTrendingTrips] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch device GPS location live
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationText('Location permission denied');
          return;
        }

        // Try to get the last known cached position first (takes milliseconds)
        let loc = await Location.getLastKnownPositionAsync();
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        }

        let reverse = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (reverse && reverse.length > 0) {
          const address = reverse[0];
          const city = address.city || address.subregion || address.district || 'Ahmedabad';
          const country = address.country || 'India';
          setLocationText(`${city}, ${country}`);
        } else {
          setLocationText('Ahmedabad, India');
        }
      } catch (error) {
        console.warn('Error fetching device location:', error);
        setLocationText('Ahmedabad, India');
      }
    })();
  }, []);

  // Fetch active trips and notifications live
  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    try {
      // 1. Fetch user's trips to find if there is an active one
      const tripsRes = await apiClient.get(`/api/dashboard/trips/${userId}`);
      if (tripsRes.data && tripsRes.data.success) {
        const userTrips = tripsRes.data.data;
        const active = userTrips.find((t: any) => t.status === 'ACTIVE');
        setActiveTrip(active || null);
      }

      // 2. Fetch active/trending trips
      const activeTripsRes = await apiClient.get('/api/admin/trips');
      if (activeTripsRes.data && activeTripsRes.data.success) {
        const allTrips = activeTripsRes.data.data;
        const trending = allTrips.filter((t: any) => t.status === 'ACTIVE' && t.userId !== userId);
        setTrendingTrips(trending.slice(0, 10));
      }

      // 3. Fetch notifications to check if there are unread ones
      const notificationsRes = await apiClient.get(`/api/dashboard/notifications/${userId}`);
      if (notificationsRes.data && notificationsRes.data.success) {
        const unreadExists = notificationsRes.data.data.some((n: any) => !n.isRead);
        setUnreadNotifications(unreadExists);
      }
    } catch (error) {
      console.warn('Error fetching dashboard overview data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Location & Notification */}
        <View style={styles.header}>
          <Pressable style={styles.locationSelector}>
            <LucideMapPin size={20} color={Theme.colors.navy} />
            <Text style={styles.locationText}>{locationText}</Text>
            <LucideChevronDown size={16} color={Theme.colors.navy} />
          </Pressable>
          <Pressable
            style={styles.notificationBtn}
            onPress={() => router.push('/notifications')}
          >
            <LucideBell size={24} color={Theme.colors.navy} />
            {unreadNotifications && <View style={styles.notificationDot} />}
          </Pressable>
        </View>

        {/* Greeting Section with Girl Graphic */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingTextContainer}>
            <Animated.Text entering={FadeInDown.delay(100)} style={styles.greeting}>
              Hello, {userName || 'Aakash'} 👋
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(200)} style={styles.mainTitle}>
              Where are you{'\n'}
              <Text style={{ color: Theme.colors.teal }}>shipping</Text> today?
            </Animated.Text>
          </View>

          {/* Overlapping girl graphic */}
          <Animated.View entering={FadeInRight.delay(300).springify()} style={styles.girlGraphicContainer}>
            <Image
              source={require('../../../assets/images/girl1.png')}
              style={styles.girlGraphic}
              contentFit="cover"
            />
          </Animated.View>
        </View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.searchContainer}>
          <LucideSearch size={20} color={Theme.colors['gray-400']} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter delivery location"
            placeholderTextColor={Theme.colors['gray-400']}
          />
          <LucideMapPin size={20} color={Theme.colors['gray-400']} />
        </Animated.View>

        {/* Action Cards */}
        <View style={styles.actionCardsRow}>
          <Animated.View entering={FadeInDown.delay(400)} style={[styles.actionCard, { marginRight: Theme.spacing.md }]}>
            <Text style={styles.actionCardTitle}>Post a Shipment</Text>
            <Text style={styles.actionCardSubtitle}>Send your package with a traveler</Text>
            <View style={styles.actionCardIconWrapper}>
              <View style={styles.mockBoxIcon}>
                <LucidePackage size={isSmallScreen ? 24 : 32} color={Theme.colors.white} />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Become a Traveler</Text>
            <Text style={styles.actionCardSubtitle}>Earn by delivering packages</Text>
            <View style={styles.actionCardIconWrapper}>
              <View style={[styles.mockBoxIcon, { backgroundColor: Theme.colors.teal }]}>
                <LucideBriefcase size={isSmallScreen ? 24 : 32} color={Theme.colors.white} />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Active Trip Section */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.activeTripSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Active Trip</Text>
            {activeTrip && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
          
          {loading ? (
            <View style={[styles.activeTripCard, { justifyContent: 'center', alignItems: 'center', paddingVertical: 30 }]}>
              <ActivityIndicator size="small" color={Theme.colors.teal} />
            </View>
          ) : activeTrip ? (
            <View style={styles.activeTripCard}>
              <View style={styles.activeTripTop}>
                <View style={styles.routeContainer}>
                  <Text style={styles.cityText}>{activeTrip.fromCity}</Text>
                  <LucideArrowRight size={20} color={Theme.colors.teal} />
                  <Text style={styles.cityText}>{activeTrip.toCity}</Text>
                </View>
                <LucidePlaneTakeoff size={24} color={Theme.colors.navy} />
              </View>
              
              <View style={styles.activeTripStatus}>
                <View style={styles.statusItem}>
                  <LucideClock size={16} color={Theme.colors['gray-500']} />
                  <Text style={styles.statusText}>
                    Travel: {new Date(activeTrip.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <LucideCheckCircle2 size={16} color={Theme.colors.teal} />
                  <Text style={[styles.statusText, { color: Theme.colors.teal }]}>Active</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View>
                  <Text style={{ fontFamily: Theme.typography.bodySmall.fontFamily, fontSize: 11, color: Theme.colors['gray-500'] }}>Available Capacity</Text>
                  <Text style={{ fontFamily: Theme.typography.h3.fontFamily, fontSize: 14, color: Theme.colors.navy }}>{activeTrip.availableWeight} kg Left</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: Theme.typography.bodySmall.fontFamily, fontSize: 11, color: Theme.colors['gray-500'] }}>Price per kg</Text>
                  <Text style={{ fontFamily: Theme.typography.h3.fontFamily, fontSize: 14, color: '#EA580C' }}>₹ {activeTrip.pricePerKg}</Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '100%' }]} />
              </View>
              
              <Pressable 
                style={styles.viewDetailsBtn}
                onPress={() => router.push({
                  pathname: '/active-trip-details',
                  params: { tripId: activeTrip.id }
                })}
              >
                <Text style={styles.viewDetailsText}>View Trip Details</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.activeTripCard, { alignItems: 'center', paddingVertical: 24 }]}>
              <LucidePlaneTakeoff size={40} color={Theme.colors['gray-400']} style={{ marginBottom: 12 }} />
              <Text style={{ fontFamily: Theme.typography.h3.fontFamily, fontSize: 16, color: Theme.colors.navy, marginBottom: 4 }}>No Active Trips Registered</Text>
              <Text style={{ fontFamily: Theme.typography.body.fontFamily, fontSize: 12, color: Theme.colors['gray-500'], textAlign: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
                Register your upcoming travel capacity to start matching with shippers.
              </Text>
              <Pressable 
                style={[styles.viewDetailsBtn, { backgroundColor: Theme.colors.teal, borderColor: Theme.colors.teal, width: '80%' }]}
                onPress={() => router.push('/create-trip')}
              >
                <Text style={[styles.viewDetailsText, { color: Theme.colors.white }]}>Register a Trip</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* Top 5 Trips Section */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.topTripsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Trending Trips</Text>
            <Pressable onPress={() => router.push('/all-trips')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topTripsScroll}
            snapToInterval={width * 0.75 + 16}
            decelerationRate="fast"
          >
            {loading ? (
              <View style={[styles.topTripCard, { width: width * 0.75, justifyContent: 'center', alignItems: 'center', minHeight: 120 }]}>
                <ActivityIndicator size="small" color={Theme.colors.teal} />
              </View>
            ) : trendingTrips.length === 0 ? (
              <View style={[styles.topTripCard, { width: width * 0.75, alignItems: 'center', justifyContent: 'center', minHeight: 120, paddingHorizontal: 16 }]}>
                <LucidePlaneTakeoff size={32} color={Theme.colors['gray-300']} style={{ marginBottom: 8 }} />
                <Text style={{ fontFamily: Theme.typography.body.fontFamily, fontSize: 13, color: Theme.colors['gray-500'], textAlign: 'center' }}>No trending trips found</Text>
              </View>
            ) : (
              trendingTrips.map((trip, idx) => (
                <Animated.View 
                  key={trip.id} 
                  entering={FadeInRight.delay(700 + (idx * 100))}
                  style={styles.topTripCard}
                >
                  <View style={styles.topTripRoute}>
                    <Text style={styles.topTripCity}>{trip.fromCity}</Text>
                    <LucideNavigation size={14} color={Theme.colors['gray-400']} />
                    <Text style={styles.topTripCity}>{trip.toCity}</Text>
                  </View>
                  <View style={styles.topTripDivider} />
                  <View style={styles.topTripDetails}>
                    <View style={styles.topTripDate}>
                      <LucideClock size={14} color={Theme.colors.teal} />
                      <Text style={styles.topTripDateText}>
                        {new Date(trip.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text style={styles.topTripPrice}>₹ {trip.pricePerKg}/kg</Text>
                  </View>
                </Animated.View>
              ))
            )}
          </ScrollView>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconBox}>
      <Icon size={24} color={Theme.colors.teal} />
    </View>
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors['off-white'],
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 120, // Space for custom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.md,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
  },
  notificationBtn: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.teal,
    borderWidth: 1,
    borderColor: Theme.colors['off-white'],
  },
  greetingSection: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: Theme.spacing.lg,
    minHeight: isSmallScreen ? 95 : 120,
  },
  greetingTextContainer: {
    flex: 1,
    paddingRight: isSmallScreen ? 60 : 80,
    justifyContent: 'center',
  },
  greeting: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-600'],
    marginBottom: 4,
  },
  mainTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: isSmallScreen ? 22 : 28,
    lineHeight: isSmallScreen ? 28 : 34,
    color: Theme.colors.navy,
    letterSpacing: -0.5,
  },
  girlGraphicContainer: {
    position: 'absolute',
    right: isSmallScreen ? -10 : -20,
    bottom: 0,
    width: isSmallScreen ? 110 : 140,
    height: isSmallScreen ? 110 : 140,
  },
  girlGraphic: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.lg,
    height: 56,
    borderRadius: Theme.borderRadius['2xl'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: Theme.spacing.xl,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    paddingHorizontal: Theme.spacing.md,
  },
  actionCardsRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    padding: isSmallScreen ? Theme.spacing.md : Theme.spacing.lg,
    borderRadius: Theme.borderRadius['2xl'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    minHeight: isSmallScreen ? 150 : 180,
    position: 'relative',
    overflow: 'hidden',
  },
  actionCardTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: isSmallScreen ? 14 : 16,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontFamily: Theme.typography.bodySmall.fontFamily,
    fontSize: isSmallScreen ? 11 : 12,
    color: Theme.colors['gray-500'],
    lineHeight: isSmallScreen ? 15 : 16,
    maxWidth: '85%',
  },
  actionCardIconWrapper: {
    position: 'absolute',
    bottom: isSmallScreen ? -5 : -10,
    right: isSmallScreen ? -5 : -10,
    width: isSmallScreen ? 60 : 80,
    height: isSmallScreen ? 60 : 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockBoxIcon: {
    width: isSmallScreen ? 38 : 50,
    height: isSmallScreen ? 38 : 50,
    backgroundColor: '#34A88C',
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresSection: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  seeAllText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors.teal,
  },
  activeTripSection: {
    marginBottom: Theme.spacing.xl,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
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
  activeTripCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing.lg,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.1)',
  },
  activeTripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityText: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  activeTripStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Theme.colors['gray-100'],
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.teal,
    borderRadius: 3,
  },
  viewDetailsBtn: {
    backgroundColor: '#F0F9F8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.teal,
  },
  topTripsSection: {
    marginBottom: Theme.spacing.xl,
  },
  topTripsScroll: {
    paddingRight: Theme.spacing.lg,
    gap: 16,
  },
  topTripCard: {
    width: width * 0.75,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
  },
  topTripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topTripCity: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
  },
  topTripDivider: {
    height: 1,
    backgroundColor: Theme.colors['gray-100'],
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  topTripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topTripDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topTripDateText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: Theme.colors.teal,
  },
  topTripPrice: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
  },
});
