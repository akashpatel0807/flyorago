import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
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

const { width } = Dimensions.get('window');

import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

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
            <Text style={styles.locationText}>Ahmedabad, India</Text>
            <LucideChevronDown size={16} color={Theme.colors.navy} />
          </Pressable>
          <Pressable
            style={styles.notificationBtn}
            onPress={() => router.push('/notifications')}
          >
            <LucideBell size={24} color={Theme.colors.navy} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* Greeting Section with Girl Graphic */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingTextContainer}>
            <Animated.Text entering={FadeInDown.delay(100)} style={styles.greeting}>
              Hello, Aakash 👋
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
                <LucidePackage size={32} color={Theme.colors.white} />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Become a Traveler</Text>
            <Text style={styles.actionCardSubtitle}>Earn by delivering packages</Text>
            <View style={styles.actionCardIconWrapper}>
              <View style={[styles.mockBoxIcon, { backgroundColor: Theme.colors.teal }]}>
                <LucideBriefcase size={32} color={Theme.colors.white} />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Active Trip Section */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.activeTripSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Active Trip</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          
          <View style={styles.activeTripCard}>
            <View style={styles.activeTripTop}>
              <View style={styles.routeContainer}>
                <Text style={styles.cityText}>Ahmedabad</Text>
                <LucideArrowRight size={20} color={Theme.colors.teal} />
                <Text style={styles.cityText}>Mumbai</Text>
              </View>
              <LucidePlaneTakeoff size={24} color={Theme.colors.navy} />
            </View>
            
            <View style={styles.activeTripStatus}>
              <View style={styles.statusItem}>
                <LucideClock size={16} color={Theme.colors['gray-500']} />
                <Text style={styles.statusText}>Departs in 2h 45m</Text>
              </View>
              <View style={styles.statusItem}>
                <LucideCheckCircle2 size={16} color={Theme.colors.teal} />
                <Text style={[styles.statusText, { color: Theme.colors.teal }]}>On Time</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View>
                <Text style={{ fontFamily: Theme.typography.bodySmall.fontFamily, fontSize: 11, color: Theme.colors['gray-500'] }}>Available Capacity</Text>
                <Text style={{ fontFamily: Theme.typography.h3.fontFamily, fontSize: 14, color: Theme.colors.navy }}>15 kg Left</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: Theme.typography.bodySmall.fontFamily, fontSize: 11, color: Theme.colors['gray-500'] }}>Expected Earnings</Text>
                <Text style={{ fontFamily: Theme.typography.h3.fontFamily, fontSize: 14, color: '#EA580C' }}>$ 150.00</Text>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
            </View>
            
            <Pressable 
              style={styles.viewDetailsBtn}
              onPress={() => router.push('/active-trip-details')}
            >
              <Text style={styles.viewDetailsText}>View Trip Details</Text>
            </Pressable>
          </View>
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
            {[
              { from: 'Ahmedabad', to: 'London', date: 'Oct 15', price: '$120/kg' },
              { from: 'Mumbai', to: 'Dubai', date: 'Oct 18', price: '$85/kg' },
              { from: 'Delhi', to: 'New York', date: 'Oct 20', price: '$150/kg' },
              { from: 'Bangalore', to: 'Singapore', date: 'Oct 22', price: '$70/kg' },
              { from: 'Chennai', to: 'Sydney', date: 'Oct 25', price: '$140/kg' },
            ].map((trip, idx) => (
              <Animated.View 
                key={idx} 
                entering={FadeInRight.delay(700 + (idx * 100))}
                style={styles.topTripCard}
              >
                <View style={styles.topTripRoute}>
                  <Text style={styles.topTripCity}>{trip.from}</Text>
                  <LucideNavigation size={14} color={Theme.colors['gray-400']} />
                  <Text style={styles.topTripCity}>{trip.to}</Text>
                </View>
                <View style={styles.topTripDivider} />
                <View style={styles.topTripDetails}>
                  <View style={styles.topTripDate}>
                    <LucideClock size={14} color={Theme.colors.teal} />
                    <Text style={styles.topTripDateText}>{trip.date}</Text>
                  </View>
                  <Text style={styles.topTripPrice}>{trip.price}</Text>
                </View>
              </Animated.View>
            ))}
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
    minHeight: 120,
  },
  greetingTextContainer: {
    flex: 1,
    paddingRight: 80,
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
    fontSize: 28,
    lineHeight: 34,
    color: Theme.colors.navy,
    letterSpacing: -0.5,
  },
  girlGraphicContainer: {
    position: 'absolute',
    right: -20,
    bottom: 0,
    width: 140,
    height: 140,
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
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius['2xl'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    minHeight: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  actionCardTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontFamily: Theme.typography.bodySmall.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
    lineHeight: 16,
    maxWidth: '80%',
  },
  actionCardIconWrapper: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockBoxIcon: {
    width: 50,
    height: 50,
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
