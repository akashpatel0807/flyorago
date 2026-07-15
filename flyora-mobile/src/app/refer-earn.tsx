import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, Gift, Share2, Copy, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CustomButton } from '../components/CustomButton';

export default function ReferEarnScreen() {
  const router = useRouter();
  const referralCode = 'FLYORAGO500';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my code ${referralCode} to get ₹500 off your first shipment or trip on FlyoraGo!`,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.bannerContainer}>
          <View style={styles.giftIconBox}>
            <Gift size={48} color={Theme.colors.white} />
          </View>
          <Text style={styles.bannerTitle}>Invite Friends & Earn</Text>
          <Text style={styles.bannerSubtitle}>
            Get ₹500 in your wallet for every friend who completes their first trip or shipment.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <Pressable style={styles.copyBtn}>
              <Copy size={20} color={Theme.colors.teal} />
            </Pressable>
          </View>

          <CustomButton 
            title="Share with Friends" 
            iconLeft={<Share2 size={20} color={Theme.colors.white} />}
            onPress={handleShare}
            style={styles.shareBtn}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>How it works</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share your code</Text>
              <Text style={styles.stepDesc}>Share your unique referral code with your friends.</Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Friend signs up</Text>
              <Text style={styles.stepDesc}>Your friend creates an account using your referral code.</Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>You both earn</Text>
              <Text style={styles.stepDesc}>Once they complete a trip, you both get ₹500 in your wallet.</Text>
            </View>
          </View>
        </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-100'],
    backgroundColor: Theme.colors.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors['off-white'],
    justifyContent: 'center',
    alignItems: 'center',
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
  bannerContainer: {
    alignItems: 'center',
    backgroundColor: Theme.colors.teal,
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
  },
  giftIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 24,
    color: Theme.colors.white,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  codeContainer: {
    backgroundColor: Theme.colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  codeLabel: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-600'],
    marginBottom: 12,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6F4F1',
    borderWidth: 2,
    borderColor: 'rgba(52, 168, 140, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  codeText: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 24,
    color: Theme.colors.teal,
    letterSpacing: 2,
  },
  copyBtn: {
    padding: 8,
  },
  shareBtn: {
    width: '100%',
  },
  howItWorks: {
    padding: 8,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    zIndex: 2,
  },
  stepNumber: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.white,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
  },
  stepTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
    lineHeight: 20,
  },
  stepLine: {
    position: 'absolute',
    left: 23,
    top: 32,
    bottom: -10,
    width: 2,
    backgroundColor: '#E6F4F1',
    zIndex: 1,
  },
});
