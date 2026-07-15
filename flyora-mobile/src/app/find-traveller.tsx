import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, User, Star, Briefcase, ChevronRight, SearchX, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { apiClient } from '../services/apiClient';
import { useAuthStore } from '../store';
import { Alert } from 'react-native';

export default function FindTravellerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fromCity = (params.fromCity as string) || '';
  const toCity = (params.toCity as string) || '';
  
  const { user } = useAuthStore();
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [travellers, setTravellers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        if (!fromCity || !toCity) return;
        
        const res = await apiClient.get('/api/dashboard/trips/search', {
          params: { fromCity, toCity, userId }
        });
        if (res.data && res.data.success) {
          setTravellers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch travellers', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [fromCity, toCity, userId]);

  const handleSendRequest = async (trip: any) => {
    try {
      const shipmentsRes = await apiClient.get(`/api/dashboard/shipments/${userId}`);
      const shipments = shipmentsRes.data.data;
      
      if (!shipments || shipments.length === 0) {
        Alert.alert('No Shipments', 'You need to create a shipment first before you can request a traveller.');
        return;
      }
      
      const selectedShipment = shipments[0];

      const matchedWeight = parseFloat(selectedShipment.weight) || 1;
      const tripPrice = parseFloat(trip.pricePerKg) || 0;
      const shipmentPrice = parseFloat(selectedShipment.pricePaid) || 0;
      const totalAmount = shipmentPrice > 0 ? shipmentPrice : (tripPrice * matchedWeight);

      await apiClient.post('/api/dashboard/bookings', {
        tripId: trip.id,
        shipmentId: selectedShipment.id,
        matchedWeight: matchedWeight,
        totalAmount: totalAmount
      });
      
      Alert.alert('Success', 'Request sent to traveller!');
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert('Info', 'You have already sent a request to this traveller.');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        Alert.alert('Error', `Failed to send request: ${errorMsg}`);
      }
    }
  };

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Find a Traveller</Text>
          <Text style={styles.headerSubtitle}>{fromCity} to {toCity}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Theme.colors.teal} />
            <Text style={styles.loadingText}>Searching for matching travellers...</Text>
          </View>
        ) : travellers.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <SearchX size={48} color={Theme.colors['gray-400']} />
            </View>
            <Text style={styles.emptyTitle}>No Travellers Found</Text>
            <Text style={styles.emptyDesc}>There are currently no active trips matching your route from {fromCity} to {toCity}.</Text>
            <TouchableOpacity style={styles.notifyBtn} onPress={() => router.back()}>
              <Text style={styles.notifyBtnText}>Go Back</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            <Text style={styles.resultsCount}>{travellers.length} matching {travellers.length === 1 ? 'traveller' : 'travellers'} found</Text>
            
            {travellers.map((traveller, idx) => (
              <Animated.View key={traveller.id || idx} entering={FadeInDown.delay(100 + idx * 50)} style={styles.travellerCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.profileBox}>
                      <View style={styles.avatarPlaceholder}>
                        <User size={20} color="#FFF" />
                      </View>
                      <View style={styles.nameBox}>
                        <Text style={styles.travellerName}>{traveller.fullName || 'Anonymous'}</Text>
                        <View style={styles.ratingRow}>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.ratingText}>4.9 (24 trips)</Text>
                          <ShieldCheck size={14} color={Theme.colors.teal} style={{ marginLeft: 6 }} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceLabel}>Price/kg</Text>
                      <Text style={styles.priceValue}>${traveller.pricePerKg}</Text>
                    </View>
                  </View>

                  <View style={styles.tripDetailsBox}>
                    <View style={styles.tripDetailItem}>
                      <Text style={styles.detailLabel}>Travel Date</Text>
                      <Text style={styles.detailValue}>{formatDate(traveller.travelDate)}</Text>
                    </View>
                    <View style={styles.tripDetailDivider} />
                    <View style={styles.tripDetailItem}>
                      <Text style={styles.detailLabel}>Available</Text>
                      <Text style={styles.detailValue}>{traveller.availableWeight} kg</Text>
                    </View>
                  </View>

                  <Pressable style={styles.requestBtn} onPress={() => handleSendRequest(traveller)}>
                    <Text style={styles.requestBtnText}>Send Request</Text>
                  </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        )}
      </View>
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
    backgroundColor: Theme.colors.white,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  headerSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Theme.typography.body.fontFamily,
    color: Theme.colors['gray-500'],
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 22,
    color: Theme.colors.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 15,
    color: Theme.colors['gray-500'],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  notifyBtn: {
    backgroundColor: Theme.colors.navy,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Theme.borderRadius.full,
  },
  notifyBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    color: Theme.colors.white,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  resultsCount: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
    marginBottom: 16,
  },
  travellerCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    padding: 20,
    marginBottom: 16,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors['gray-300'],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameBox: {
    flex: 1,
  },
  travellerName: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-600'],
    marginLeft: 4,
  },
  priceBadge: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-500'],
  },
  priceValue: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.teal,
  },
  tripDetailsBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  tripDetailItem: {
    flex: 1,
  },
  tripDetailDivider: {
    width: 1,
    backgroundColor: Theme.colors['gray-200'],
    marginHorizontal: 12,
  },
  detailLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
  },
  actionRow: {
    flexDirection: 'row',
  },
  requestBtn: {
    flex: 1,
    backgroundColor: Theme.colors.teal,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    color: Theme.colors.white,
    fontSize: 15,
  }
});
