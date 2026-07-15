import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, Search, SlidersHorizontal, PlaneTakeoff, Calendar, Briefcase, Plane } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '../store';
import { apiClient } from '../services/apiClient';

export default function AllTripsScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [userId])
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>All Your Trips</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={Theme.colors['gray-400']} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by city..."
            placeholderTextColor={Theme.colors['gray-400']}
          />
        </View>
        <Pressable style={styles.filterBtn}>
          <SlidersHorizontal size={20} color={Theme.colors.navy} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.teal} style={{ marginTop: 40 }} />
        ) : trips.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Plane size={40} color={Theme.colors['gray-400']} />
            </View>
            <Text style={styles.emptyTitle}>No Trips Found</Text>
            <Text style={styles.emptyDesc}>You don't have any trips recorded yet.</Text>
          </Animated.View>
        ) : (
          trips.map((trip, idx) => (
            <Animated.View 
              key={trip.id || idx} 
              entering={FadeInUp.delay(idx * 50).springify()} 
              style={styles.tripCard}
            >
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
  },
  headerTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  }
});
