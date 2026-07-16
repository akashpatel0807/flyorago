import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, CheckCircle2, Package, Clock, ShieldAlert, CreditCard } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { useAuthStore } from '../store';
import { apiClient } from '../services/apiClient';

const { width } = Dimensions.get('window');

type NotificationType = 'success' | 'alert' | 'system' | 'payment';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  isRead: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Shipment Created Successfully',
    message: 'Your package to Toronto has been listed. Waiting for a traveler to match.',
    time: '2 mins ago',
    type: 'success',
    isRead: false,
  },
  {
    id: '2',
    title: 'New Traveler Match!',
    message: 'Aakash P. is traveling to Toronto and can carry your package. Tap to review.',
    time: '15 mins ago',
    type: 'system',
    isRead: false,
  },
  {
    id: '3',
    title: 'Payment Received',
    message: 'We have securely held the payment for your upcoming delivery to London.',
    time: '1 hour ago',
    type: 'payment',
    isRead: false,
  },
  {
    id: '4',
    title: 'Action Required: Identity Verification',
    message: 'Please complete your KYC to increase trust and get matched faster.',
    time: 'Yesterday',
    type: 'alert',
    isRead: true,
  },
  {
    id: '5',
    title: 'Welcome to FlyoraGo!',
    message: 'Start connecting with travelers and senders worldwide. Explore now!',
    time: '2 days ago',
    type: 'system',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await apiClient.get(`/api/dashboard/notifications/${userId}`);
      if (res.data && res.data.success) {
        setNotifications(res.data.data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          type: n.type as NotificationType,
          isRead: n.isRead
        })));
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/api/dashboard/notifications/mark-read', { userId });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Error marking all notifications read:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.post('/api/dashboard/notifications/mark-read', { notificationId: id });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.warn('Error marking notification read:', err);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={24} color={Theme.colors.white} />;
      case 'alert':
        return <ShieldAlert size={24} color={Theme.colors.white} />;
      case 'payment':
        return <CreditCard size={24} color={Theme.colors.white} />;
      case 'system':
      default:
        return <Package size={24} color={Theme.colors.white} />;
    }
  };

  const getIconBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return '#34A88C';
      case 'alert': return '#F56565';
      case 'payment': return '#ECC94B';
      case 'system': return Theme.colors.navy;
      default: return Theme.colors.teal;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable onPress={markAllAsRead} style={styles.markReadBtn}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>You have {unreadCount} new messages</Text>
          <Text style={styles.summarySubtitle}>Stay updated on your shipments and trips in real-time.</Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <ActivityIndicator size="large" color={Theme.colors.teal} />
          </View>
        ) : (
          <>
            {notifications.map((notification, index) => (
              <Animated.View 
                key={notification.id}
                entering={FadeInRight.delay(index * 100).springify()}
                layout={Layout.springify()}
              >
                <Pressable 
                  style={[styles.notificationCard, !notification.isRead && styles.unreadCard]}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: getIconBgColor(notification.type) }]}>
                    {getIcon(notification.type)}
                  </View>
                  
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.title, !notification.isRead && styles.unreadTitle]} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      <Text style={styles.time}>{notification.time}</Text>
                    </View>
                    <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
                  </View>
                  
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </Pressable>
              </Animated.View>
            ))}
            
            {notifications.length === 0 && (
              <View style={styles.emptyState}>
                <Clock size={48} color={Theme.colors['gray-300']} />
                <Text style={styles.emptyTitle}>No Notifications Yet</Text>
                <Text style={styles.emptySubtitle}>When you get updates, they'll appear here.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors['off-white'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-100'],
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors['gray-50'],
    borderRadius: 20,
  },
  headerTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  markReadBtn: {
    padding: 8,
  },
  markReadText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: Theme.colors.teal,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 20,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadCard: {
    backgroundColor: '#F0F9F8', // very light teal
    borderLeftColor: Theme.colors.teal,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    marginRight: 8,
  },
  unreadTitle: {
    fontFamily: Theme.typography.h3.fontFamily, // bold
  },
  time: {
    fontFamily: Theme.typography.bodySmall.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-400'],
  },
  message: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.teal,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
    textAlign: 'center',
  },
});
