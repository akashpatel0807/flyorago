import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  SafeAreaView,
  StatusBar,
  LayoutAnimation,
} from 'react-native';
import { Link, Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '../store';
import { Colors, Radius, Spacing } from '../constants/theme';
import { CustomButton } from '../components/CustomButton';
import { GlassCard } from '../components/GlassCard';
import {
  Plane,
  Shield,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';

const FAQS = [
  {
    q: 'How does Flyorago secure payments?',
    a: 'Flyorago uses an Escrow protection mechanism. Senders pay for shipments upfront, and the funds are held securely until the traveler successfully delivers the package and the sender confirms it in the app.',
  },
  {
    q: 'What verification measures exist?',
    a: 'All participants must go through a mandatory KYC (Know Your Customer) check uploading verified government IDs and live selfies. This builds a verified, trusted marketplace community.',
  },
  {
    q: 'How are shipping rates determined?',
    a: 'Travelers set their own price per kilogram (kg) when publishing their trips, and senders specify the fee they are willing to pay. This creates a competitive, peer-to-peer bidding system.',
  },
];

export default function LandingScreen() {
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const { isAuthenticated, userRole } = useAuthStore();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Auto redirect if already logged in
  if (isAuthenticated) {
    if (userRole === 'admin') {
      return <Redirect href="/admin/dashboard" />;
    }
    return <Redirect href={"/(tabs)" as any} />;
  } else {
    return <Redirect href="/onboarding" />;
  }

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: activeColors.primary }]}>
            <Plane size={18} color="#fff" style={styles.planeIcon} />
          </View>
          <Text style={[styles.logoText, { color: activeColors.navy }]}>
            fly<Text style={{ color: activeColors.primary }}>orago</Text>
          </Text>
        </View>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.loginTextBtn}>
            <Text style={[styles.loginText, { color: activeColors.primary }]}>Log In</Text>
          </Pressable>
        </Link>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Sparkles size={12} color={activeColors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: activeColors.primary }]}>
              PREMIUM LUGGAGE SHARING
            </Text>
          </View>
          
          <Text style={[styles.heroTitle, { color: activeColors.navy }]}>
            Smart Global Delivery,{'\n'}Powered by {'\n'}
            <Text style={{ color: activeColors.primary }}>Real Travelers</Text>
          </Text>
          
          <Text style={[styles.heroSubtitle, { color: activeColors.textSecondary }]}>
            Flyorago transforms unused international luggage capacity into a secure, fast, and cost-effective shipping marketplace.
          </Text>

          <View style={styles.ctaGroup}>
            <CustomButton
              title="Get Started Now"
              onPress={() => router.push('/(auth)/signup')}
              fullWidth
              size="lg"
              iconRight={<ArrowRight size={18} color="#fff" />}
            />
          </View>
        </View>

        {/* Features / Why Choose Us */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: activeColors.navy }]}>Why Choose Flyorago?</Text>
          
          <GlassCard style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(13, 148, 136, 0.1)' }]}>
              <TrendingUp size={24} color={activeColors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureCardTitle, { color: activeColors.text }]}>Traveler Earnings</Text>
              <Text style={[styles.featureCardDesc, { color: activeColors.textSecondary }]}>
                Monetize your empty luggage space. Earn extra money on flights you are already taking.
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(2, 132, 199, 0.1)' }]}>
              <Shield size={24} color={activeColors.accent} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureCardTitle, { color: activeColors.text }]}>Verified KYC Community</Text>
              <Text style={[styles.featureCardDesc, { color: activeColors.textSecondary }]}>
                Mandatory profile verification creates a safe, reliable ecosystem for all travelers and senders.
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Lock size={24} color={activeColors.success} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureCardTitle, { color: activeColors.text }]}>Secure Escrow Locks</Text>
              <Text style={[styles.featureCardDesc, { color: activeColors.textSecondary }]}>
                Payments are held securely in escrow and released only upon delivery confirmation.
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Dynamic Stats */}
        <View style={[styles.section, styles.statsContainer, { backgroundColor: activeColors.navy }]}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10k+</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5k+</Text>
            <Text style={styles.statLabel}>Parcels Shipped</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>$450k+</Text>
            <Text style={styles.statLabel}>Traveler Payouts</Text>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: activeColors.navy }]}>Frequently Asked Questions</Text>
          
          {FAQS.map((faq, idx) => (
            <Pressable
              key={idx}
              onPress={() => toggleFaq(idx)}
              style={[
                styles.faqItem,
                { borderBottomColor: activeColors.border }
              ]}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: activeColors.text }]}>{faq.q}</Text>
                {expandedFaq === idx ? (
                  <ChevronUp size={20} color={activeColors.textSecondary} />
                ) : (
                  <ChevronDown size={20} color={activeColors.textSecondary} />
                )}
              </View>
              {expandedFaq === idx && (
                <Text style={[styles.faqAnswer, { color: activeColors.textSecondary }]}>
                  {faq.a}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Admin Gateway Shortcut */}
        <View style={styles.adminSection}>
          <Link href="/admin/login" asChild>
            <Pressable style={styles.adminBtn}>
              <Text style={[styles.adminBtnText, { color: activeColors.textSecondary }]}>
                Access Admin Portal
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  planeIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  loginTextBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  loginText: {
    fontWeight: '800',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  hero: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.round,
    marginBottom: Spacing.three,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: Spacing.three,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: Spacing.four,
  },
  ctaGroup: {
    width: '100%',
    marginVertical: Spacing.two,
  },
  section: {
    paddingHorizontal: Spacing.four,
    marginVertical: Spacing.four,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: Spacing.four,
    letterSpacing: -0.5,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
    padding: Spacing.three * 1.25,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureCardDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.five,
    borderRadius: Radius.xxl,
    marginHorizontal: Spacing.four,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 8,
  },
  adminSection: {
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  adminBtn: {
    padding: 12,
  },
  adminBtnText: {
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
