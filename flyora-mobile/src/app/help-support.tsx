import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, MessageCircle, Phone, Mail, FileText, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HelpSupportScreen() {
  const router = useRouter();

  const handleContact = (type: string) => {
    // Implement linking logic for email/phone
    if (type === 'email') {
      Linking.openURL('mailto:support@flyorago.com');
    } else if (type === 'phone') {
      Linking.openURL('tel:+919988776655');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.heroSection}>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>We're here to help you with any issues you might face.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.contactOptions}>
          <Pressable style={styles.contactCard} onPress={() => handleContact('chat')}>
            <View style={[styles.iconBox, { backgroundColor: '#E6F4F1' }]}>
              <MessageCircle size={24} color={Theme.colors.teal} />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactDesc}>Typical reply within 5 mins</Text>
            </View>
            <ChevronRight size={20} color={Theme.colors['gray-400']} />
          </Pressable>

          <Pressable style={styles.contactCard} onPress={() => handleContact('email')}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
              <Mail size={24} color="#6366F1" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Email Us</Text>
              <Text style={styles.contactDesc}>support@flyorago.com</Text>
            </View>
            <ChevronRight size={20} color={Theme.colors['gray-400']} />
          </Pressable>

          <Pressable style={styles.contactCard} onPress={() => handleContact('phone')}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Phone size={24} color="#D97706" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactDesc}>+91 9988776655</Text>
            </View>
            <ChevronRight size={20} color={Theme.colors['gray-400']} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          
          <Pressable style={styles.faqItem}>
            <View style={styles.faqIcon}>
              <FileText size={20} color={Theme.colors.navy} />
            </View>
            <Text style={styles.faqText}>How do I create a shipment?</Text>
            <ChevronRight size={20} color={Theme.colors['gray-400']} />
          </Pressable>

          <Pressable style={styles.faqItem}>
            <View style={styles.faqIcon}>
              <FileText size={20} color={Theme.colors.navy} />
            </View>
            <Text style={styles.faqText}>How does payment work?</Text>
            <ChevronRight size={20} color={Theme.colors['gray-400']} />
          </Pressable>

          <Pressable style={styles.faqItem}>
            <View style={styles.faqIcon}>
              <FileText size={20} color={Theme.colors.navy} />
            </View>
            <Text style={styles.faqText}>What items are prohibited?</Text>
            <ChevronRight size={20} color={Theme.colors['gray-400']} />
          </Pressable>
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
  heroSection: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  heroTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 28,
    color: Theme.colors.navy,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 15,
    color: Theme.colors['gray-500'],
    lineHeight: 22,
  },
  contactOptions: {
    marginBottom: 32,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  contactDesc: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
  },
  sectionTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
    marginBottom: 16,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
  },
  faqIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Theme.colors['off-white'],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  faqText: {
    flex: 1,
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
  },
});
