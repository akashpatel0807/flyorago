import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useToastStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Bell,
  CheckCircle2,
  Package,
  Plane,
  Star,
  Wallet,
  User,
  MapPin,
  CreditCard,
  Gift,
  HelpCircle,
  Settings,
  ChevronRight,
  Pencil,
  ShieldCheck,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380 || height < 700;

// Helper to get initials
const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function ProfileScreen() {
  const router = useRouter();
  const { userId, userName, userEmail, profileImageUrl, updateProfileImage } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [stats, setStats] = useState({
    shipments: 0,
    trips: 0,
    rating: '5.0',
    walletBalance: 0,
  });

  const displayName = userName || 'Aakash Patel';
  const displayEmail = userEmail || 'aakashpatel@gmail.com';

  // Load user profile details and stats on mount
  useEffect(() => {
    (async () => {
      if (!userId) return;
      try {
        setLoadingProfile(true);
        
        // Fetch profile details
        const profileRes = await apiClient.get(`/api/dashboard/profile/${userId}`);
        let ratingVal = '5.0';
        if (profileRes.data && profileRes.data.success && profileRes.data.data) {
          await updateProfileImage(profileRes.data.data.profileImageUrl);
          if (profileRes.data.data.averageRating) {
            ratingVal = Number(profileRes.data.data.averageRating).toFixed(1);
          }
        }

        // Fetch overview stats
        const overviewRes = await apiClient.get(`/api/dashboard/overview/${userId}`);
        if (overviewRes.data && overviewRes.data.success && overviewRes.data.data) {
          const s = overviewRes.data.data.stats;
          setStats({
            shipments: s.totalShipmentsCount || 0,
            trips: s.totalTripsCount || 0,
            rating: ratingVal,
            walletBalance: s.walletBalance || 0,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch profile info and stats on mount:', err);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [userId]);

  const handleSelectAndUploadImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission to access gallery is required to upload a profile picture.', 'error');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.25, // Optimize and compress
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Img = 'data:image/jpeg;base64,' + result.assets[0].base64;
        setLoadingProfile(true);
        
        const response = await apiClient.put(`/api/dashboard/profile/${userId}`, {
          profileImageUrl: base64Img
        });

        if (response.data && response.data.success) {
          await updateProfileImage(base64Img);
          showToast('Profile image updated successfully!', 'success');
        } else {
          showToast('Failed to upload image.', 'error');
        }
      }
    } catch (error) {
      console.warn('Error launching image picker / uploading:', error);
      showToast('Error uploading profile picture.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const renderMenuItem = (
    icon: React.ReactNode, 
    title: string, 
    subtitle: string, 
    badge?: React.ReactNode, 
    onPress?: () => void
  ) => (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconBox}>
          {icon}
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.menuItemTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.menuItemSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {badge}
        <ChevronRight size={20} color={Theme.colors['gray-400']} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      {/* Background Graphic */}
      <View style={styles.bgGraphicContainer}>
        {/* Placeholder for the Globe and luggage background graphic */}
        <View style={styles.globePlaceholder} />
      </View>

      {/* Header (Fixed outside ScrollView) */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Package size={20} color={Theme.colors.white} />
          </View>
          <View>
            <Text style={styles.logoTitle}>flyorago</Text>
            <Text style={styles.logoSubtitle}>SHIP SMARTER</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/notifications')}>
          <Bell size={24} color={Theme.colors.navy} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar & Info */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{getInitials(displayName)}</Text>
              </View>
            )}
            
            {loadingProfile && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: isSmallScreen ? 40 : 50, justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}>
                <ActivityIndicator size="small" color={Theme.colors.white} />
              </View>
            )}

            {/* Outline ring */}
            <View style={styles.avatarRing} />

            <Pressable style={styles.editBtn} onPress={handleSelectAndUploadImage} disabled={loadingProfile}>
              <Pencil size={14} color={Theme.colors.white} />
            </Pressable>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{displayName}</Text>
            <CheckCircle2 size={18} color={Theme.colors.teal} style={{ marginLeft: 6 }} />
          </View>
          <Text style={styles.emailText}>{displayEmail}</Text>

          <View style={styles.verifiedBadge}>
            <ShieldCheck size={14} color={Theme.colors.teal} style={{ marginRight: 6 }} />
            <Text style={styles.verifiedText}>Verified Traveler</Text>
          </View>
        </Animated.View>

        {/* Stats Card */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Package size={20} color={Theme.colors.teal} />
            </View>
            <Text style={styles.statValue}>{stats.shipments}</Text>
            <Text style={styles.statLabel}>Shipments</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Plane size={20} color={Theme.colors.teal} />
            </View>
            <Text style={styles.statValue}>{stats.trips}</Text>
            <Text style={styles.statLabel}>Trips as{'\n'}Traveler</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Star size={20} color={Theme.colors.teal} />
            </View>
            <Text style={styles.statValue}>{stats.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Wallet size={20} color={Theme.colors.teal} />
            </View>
            <Text style={styles.statValue}>₹{stats.walletBalance.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Wallet Balance</Text>
          </View>
        </Animated.View>

        {/* Menu Options */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.menuCard}>
          {renderMenuItem(
            <User size={20} color={Theme.colors.teal} />,
            'Personal Information',
            'Update your profile details',
            undefined,
            () => router.push('/personal-information')
          )}
          <View style={styles.menuDivider} />

          {renderMenuItem(
            <MapPin size={20} color={Theme.colors.teal} />,
            'Addresses',
            'Manage your saved addresses',
            undefined,
            () => router.push('/addresses')
          )}
          <View style={styles.menuDivider} />

          {renderMenuItem(
            <CreditCard size={20} color={Theme.colors.teal} />,
            'Payment Methods',
            'Cards, UPI & Wallet',
            undefined,
            () => router.push('/payment-methods')
          )}
          <View style={styles.menuDivider} />

          {renderMenuItem(
            <Package size={20} color={Theme.colors.teal} />,
            'My Shipments',
            'Track and manage your shipments',
            undefined,
            () => router.push('/(tabs)/shipments')
          )}
          <View style={styles.menuDivider} />

          {renderMenuItem(
            <Plane size={20} color={Theme.colors.teal} />,
            'My Trips',
            'View your trips as a traveler',
            undefined,
            () => router.push('/(tabs)/trips')
          )}
          <View style={styles.menuDivider} />

          {renderMenuItem(
            <Gift size={20} color={Theme.colors.teal} />,
            'Refer & Earn',
            'Invite friends and earn rewards',
            undefined,
            () => router.push('/refer-earn')
          )}
          <View style={styles.menuDivider} />

          {renderMenuItem(
            <Bell size={20} color={Theme.colors.teal} />,
            'Notifications',
            'Manage your notification preferences',
            undefined,
            () => router.push('/notifications')
          )}
          <View style={styles.menuDivider} />

          {renderMenuItem(
            <HelpCircle size={20} color={Theme.colors.teal} />,
            'Help & Support',
            'Get help and contact support',
            undefined,
            () => router.push('/help-support')
          )}
          <View style={styles.menuDivider} />

          {renderMenuItem(
            <Settings size={20} color={Theme.colors.teal} />,
            'Settings',
            'App settings and preferences',
            undefined,
            () => router.push('/settings-preferences')
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBFA', // Slightly cooler off-white to match image background
  },
  bgGraphicContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    overflow: 'hidden',
    zIndex: 0,
  },
  globePlaceholder: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: '#E6F4F1', // Soft teal color for background graphic substitute
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120, // Tab bar spacing
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Theme.colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
    lineHeight: 20,
  },
  logoSubtitle: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 9,
    color: Theme.colors['gray-500'],
    letterSpacing: 1.5,
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F56565', // Red dot for notification
    borderWidth: 1.5,
    borderColor: '#F7FBFA',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: isSmallScreen ? 80 : 100,
    height: isSmallScreen ? 80 : 100,
    borderRadius: isSmallScreen ? 40 : 50,
  },
  avatarFallback: {
    width: isSmallScreen ? 80 : 100,
    height: isSmallScreen ? 80 : 100,
    borderRadius: isSmallScreen ? 40 : 50,
    backgroundColor: Theme.colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: isSmallScreen ? 28 : 36,
    color: Theme.colors.white,
  },
  avatarRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: isSmallScreen ? 48 : 60,
    borderWidth: 2,
    borderColor: 'rgba(52, 168, 140, 0.2)', // Light teal ring
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: isSmallScreen ? 18 : 22,
    color: Theme.colors.navy,
  },
  emailText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: isSmallScreen ? 12 : 14,
    color: Theme.colors['gray-500'],
    marginBottom: isSmallScreen ? 8 : 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 168, 140, 0.1)', // Light teal bg
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: Theme.colors.teal,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 16 : 24,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBox: {
    width: isSmallScreen ? 30 : 36,
    height: isSmallScreen ? 30 : 36,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 168, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 8 : 12,
  },
  statValue: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-500'],
    textAlign: 'center',
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: Theme.colors['gray-100'],
    alignSelf: 'center',
  },
  menuCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 8,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  menuItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: isSmallScreen ? 34 : 40,
    height: isSmallScreen ? 34 : 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 168, 140, 0.08)', // Very light teal
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 10 : 16,
  },
  menuItemTitle: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: isSmallScreen ? 14 : 15,
    color: Theme.colors.navy,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: isSmallScreen ? 11 : 12,
    color: Theme.colors['gray-400'],
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnBadge: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  earnBadgeText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: Theme.colors.teal,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Theme.colors['gray-100'],
    marginLeft: 68, // Align with text start
    marginRight: 12,
  },
});
