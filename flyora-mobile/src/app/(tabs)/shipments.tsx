import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  Modal,
  Dimensions,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Search,
  Bell,
  Package,
  Truck,
  XCircle,
  Copy,
  ChevronRight,
  Filter,
  Edit2,
  Trash2,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380 || height < 700;

const FILTER_TABS = ['All', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

// Helper to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function ShipmentsScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();

  const [activeTab, setActiveTab] = useState('All');
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [editingShipment, setEditingShipment] = useState<any>(null);
  const [deletingShipment, setDeletingShipment] = useState<any>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');

  const fetchShipments = async () => {
    try {
      if (!userId) {
        setShipments([]);
        setLoading(false);
        return;
      }
      const response = await apiClient.get(`/api/dashboard/shipments/${userId}`);
      if (response.data && response.data.success) {
        setShipments(response.data.data || []);
      } else {
        setShipments([]);
      }
    } catch (error) {
      console.error('Failed to load shipments:', error);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [userId]);

  // Derived stats
  const stats = useMemo(() => {
    return {
      total: shipments.length,
      inTransit: shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PENDING').length,
      delivered: shipments.filter(s => s.status === 'DELIVERED').length,
      cancelled: shipments.filter(s => s.status === 'CANCELLED').length,
    };
  }, [shipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    if (activeTab === 'All') return shipments;
    if (activeTab === 'In Transit') return shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PENDING');
    if (activeTab === 'Delivered') return shipments.filter(s => s.status === 'DELIVERED');
    if (activeTab === 'Cancelled') return shipments.filter(s => s.status === 'CANCELLED');
    return shipments;
  }, [shipments, activeTab]);

  const handleDeleteShipment = async () => {
    if (deletingShipment) {
      try {
        await apiClient.delete(`/api/dashboard/shipments/${deletingShipment.id}`);
        setShipments(prev => prev.filter(s => s.id !== deletingShipment.id));
      } catch (error) {
        console.error('Failed to delete shipment:', error);
      } finally {
        setDeletingShipment(null);
      }
    }
  };

  const handleEditShipment = async () => {
    if (editingShipment) {
      try {
        await apiClient.put(`/api/dashboard/shipments/${editingShipment.id}`, {
          weight: Number(editWeight) || editingShipment.weight,
        });
        setShipments(prev => prev.map(s => {
          if (s.id === editingShipment.id) {
            return { ...s, weight: editWeight || s.weight };
          }
          return s;
        }));
      } catch (error) {
        console.error('Failed to edit shipment:', error);
      } finally {
        setEditingShipment(null);
      }
    }
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <View style={[styles.statusPill, { backgroundColor: '#E6F4F1' }]}>
            <Text style={[styles.statusText, { color: Theme.colors.teal }]}>Delivered</Text>
          </View>
        );
      case 'CANCELLED':
        return (
          <View style={[styles.statusPill, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: '#EF4444' }]}>Cancelled</Text>
          </View>
        );
      case 'IN_TRANSIT':
      case 'PENDING':
      default:
        return (
          <View style={[styles.statusPill, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.statusText, { color: '#3B82F6' }]}>In Transit</Text>
          </View>
        );
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Sender</Text>
          <Text style={styles.headerSubtitle}>Manage your packages & requests</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >


        {/* Stats Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statsCardContainer}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.statsCardGradient}
          >
            <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Package size={isSmallScreen ? 14 : 18} color="#2DD4BF" />
              </View>
              <Text style={[styles.statValue, { color: Theme.colors.white }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.6)' }]}>Total</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Truck size={isSmallScreen ? 14 : 18} color="#3B82F6" />
              </View>
              <Text style={[styles.statValue, { color: Theme.colors.white }]}>{stats.inTransit}</Text>
              <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.6)' }]}>In Transit</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Package size={isSmallScreen ? 14 : 18} color="#34A88C" />
              </View>
              <Text style={[styles.statValue, { color: Theme.colors.white }]}>{stats.delivered}</Text>
              <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.6)' }]}>Delivered</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <XCircle size={isSmallScreen ? 14 : 18} color="#EF4444" />
              </View>
              <Text style={[styles.statValue, { color: Theme.colors.white }]}>{stats.cancelled}</Text>
              <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.6)' }]}>Cancelled</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Create Request Prominent Button */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.createBtnAnimWrapper}>
          <Pressable 
            style={({ pressed }) => [
              styles.createBtnPressable,
              pressed && styles.cardPressedEffect
            ]}
            onPress={() => router.push('/create-shipment')}
          >
            <LinearGradient
              colors={['#0D9488', '#0F766E']}
              style={styles.createBtnGradient}
            >
              <Text style={styles.createBtnText}>+ Create New Request</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Recent Shipments Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Shipments</Text>
          <Pressable style={styles.filterBtn} onPress={() => setIsFilterVisible(true)}>
            <Text style={styles.filterBtnText}>Filter</Text>
            <Filter size={16} color={Theme.colors['gray-500']} />
          </Pressable>
        </View>

        {/* Shipments List or Empty State */}
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.teal} style={{ marginTop: 40 }} />
        ) : filteredShipments.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Package size={48} color={Theme.colors['gray-300']} />
            </View>
            <Text style={styles.emptyTitle}>No shipments found</Text>
            <Text style={styles.emptySubtitle}>You don't have any shipments matching this filter.</Text>
          </Animated.View>
        ) : (
          filteredShipments.map((shipment, index) => (
            <Animated.View key={shipment.id || index} entering={FadeInDown.delay(150 + index * 50)}>
              <Pressable 
                style={styles.shipmentCard}
                onPress={() => router.push({ pathname: '/package-details', params: { shipment: JSON.stringify(shipment) } })}
              >
              <View style={styles.shipmentImageContainer}>
                <Image 
                  source={shipment.images && shipment.images.length > 0 ? shipment.images[0] : 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=400&q=80'} 
                  style={{ width: '100%', height: '100%' }} 
                  contentFit="cover" 
                />
              </View>
              
              <View style={styles.shipmentDetails}>
                <View style={styles.shipmentHeaderRow}>
                  <View style={styles.idRow}>
                    <Text style={styles.shipmentId}>#{shipment.id ? shipment.id.substring(0, 10).toUpperCase() : 'FLY123456789'}</Text>
                    <Copy size={12} color={Theme.colors['gray-400']} style={{ marginLeft: 6 }} />
                  </View>
                  {renderStatusPill(shipment.status || 'IN_TRANSIT')}
                </View>

                <View style={styles.routeRow}>
                  <Text style={styles.cityText} numberOfLines={1}>{shipment.fromCity || 'Ahmedabad'}</Text>
                  <Truck size={12} color={Theme.colors.teal} style={{ marginHorizontal: 6 }} />
                  <Text style={styles.cityText} numberOfLines={1}>{shipment.toCity || 'Mumbai'}</Text>
                </View>

                <Text style={styles.metaText}>
                  {shipment.weight ? `${shipment.weight} kg` : '1.5 kg'} • {shipment.category || 'Electronics'}
                </Text>

                <View style={styles.footerRow}>
                  <Text style={styles.statusFooterText} numberOfLines={1}>
                    <Text style={{ color: Theme.colors.teal, fontWeight: '600' }}>
                      {shipment.status === 'DELIVERED' ? 'Delivered' : 'In Transit'}
                    </Text>
                    {' • '}
                    {shipment.status === 'DELIVERED' ? formatDate(shipment.updatedAt) : `Arrives ${formatDate(shipment.deliveryDeadline)}`}
                  </Text>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceText} adjustsFontSizeToFit numberOfLines={1}>${shipment.pricePaid || '450'}</Text>
                    <Text style={styles.timeText}>2h ago</Text>
                  </View>
                </View>

                {shipment.status === 'PENDING' && (
                  <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity 
                      style={{ flex: 1, backgroundColor: Theme.colors.navy, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push({ pathname: '/find-traveller', params: { fromCity: shipment.fromCity, toCity: shipment.toCity } });
                      }}
                    >
                      <Text style={{ color: Theme.colors.white, fontFamily: Theme.typography.h3.fontFamily, fontSize: 12 }}>Find Traveler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
                      onPress={(e) => {
                        e.stopPropagation();
                        setEditWeight(shipment.weight?.toString() || '');
                        setEditDate(formatDate(shipment.createdAt || new Date().toISOString()));
                        setEditingShipment(shipment);
                      }}
                    >
                      <Edit2 size={16} color={Theme.colors['gray-600']} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}
                      onPress={(e) => {
                        e.stopPropagation();
                        setDeletingShipment(shipment);
                      }}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              </Pressable>
            </Animated.View>
          ))
        )}

      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={isFilterVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Shipments</Text>
              <Pressable onPress={() => setIsFilterVisible(false)}>
                <XCircle size={24} color={Theme.colors['gray-400']} />
              </Pressable>
            </View>
            {FILTER_TABS.map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={styles.modalOption} 
                onPress={() => {
                  setActiveTab(tab);
                  setIsFilterVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, activeTab === tab && { color: Theme.colors.teal, fontFamily: Theme.typography.h3.fontFamily }]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.activeDot} />}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={!!deletingShipment} transparent animationType="fade" onRequestClose={() => setDeletingShipment(null)}>
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Shipment</Text>
              <Pressable onPress={() => setDeletingShipment(null)}>
                <XCircle size={24} color={Theme.colors['gray-400']} />
              </Pressable>
            </View>
            <Text style={{ fontFamily: Theme.typography.body.fontFamily, fontSize: 15, color: Theme.colors['gray-500'], marginBottom: 24, lineHeight: 22 }}>
              Are you sure you want to cancel request #{deletingShipment?._id?.substring(0, 10).toUpperCase()}? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} onPress={() => setDeletingShipment(null)}>
                <Text style={{ fontFamily: Theme.typography.h3.fontFamily, color: Theme.colors['gray-600'] }}>No, Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} onPress={handleDeleteShipment}>
                <Text style={{ fontFamily: Theme.typography.h3.fontFamily, color: Theme.colors.white }}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Edit Shipment Modal */}
      <Modal visible={!!editingShipment} transparent animationType="fade" onRequestClose={() => setEditingShipment(null)}>
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Request</Text>
              <Pressable onPress={() => setEditingShipment(null)}>
                <XCircle size={24} color={Theme.colors['gray-400']} />
              </Pressable>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontFamily: Theme.typography.bodyMedium.fontFamily, fontSize: 13, color: Theme.colors.navy, marginBottom: 8 }}>Weight (kg)</Text>
              <TextInput 
                style={{ backgroundColor: '#F7FBFA', borderWidth: 1, borderColor: Theme.colors['gray-200'], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: Theme.typography.body.fontFamily, fontSize: 15, color: Theme.colors.navy }} 
                value={editWeight}
                onChangeText={setEditWeight}
                keyboardType="numeric"
                placeholder="e.g. 2.5"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontFamily: Theme.typography.bodyMedium.fontFamily, fontSize: 13, color: Theme.colors.navy, marginBottom: 8 }}>Travel Date</Text>
              <TextInput 
                style={{ backgroundColor: '#F7FBFA', borderWidth: 1, borderColor: Theme.colors['gray-200'], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: Theme.typography.body.fontFamily, fontSize: 15, color: Theme.colors.navy }} 
                value={editDate}
                onChangeText={setEditDate}
                placeholder="e.g. 24 Oct"
              />
            </View>

            <TouchableOpacity style={{ backgroundColor: Theme.colors.teal, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} onPress={handleEditShipment}>
              <Text style={{ fontFamily: Theme.typography.h3.fontFamily, color: Theme.colors.white }}>Save Changes</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBFA', // matching background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: isSmallScreen ? 20 : 24,
    color: Theme.colors.navy,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: isSmallScreen ? 12 : 14,
    color: Theme.colors['gray-500'],
  },
  createBtnAnimWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  createBtnPressable: {
    width: '100%',
  },
  createBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
    fontWeight: '800',
  },
  cardPressedEffect: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  scrollContent: {
    paddingBottom: 120, // space for tab bar
  },
  filterTabsWrapper: {
    backgroundColor: '#F7FBFA',
    paddingVertical: 10,
    zIndex: 2,
  },
  filterTabsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
  },
  filterTabActive: {
    backgroundColor: Theme.colors.teal,
    borderColor: Theme.colors.teal,
  },
  filterTabText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-600'],
  },
  filterTabTextActive: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
  statsCardContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: isSmallScreen ? 16 : 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  statsCardGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: isSmallScreen ? 16 : 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  statIconBox: {
    width: isSmallScreen ? 32 : 38,
    height: isSmallScreen ? 32 : 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '800',
  },
  statLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 32,
    alignSelf: 'center',
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.navy,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
    gap: 6,
  },
  filterBtnText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-600'],
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
    textAlign: 'center',
    lineHeight: 22,
  },
  shipmentCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.05)',
  },
  shipmentImageContainer: {
    width: 72,
    height: 72,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  fallbackImageBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shipmentDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  shipmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  shipmentId: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 13,
    color: Theme.colors.navy,
    fontWeight: '800',
    flexShrink: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
    marginRight: 4,
  },
  statusText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 4,
    gap: 4,
  },
  cityText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
    fontWeight: '800',
    flexShrink: 1,
  },
  metaText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-500'],
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  statusFooterText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-500'],
    flex: 1,
    paddingRight: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  priceText: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 16,
    color: Theme.colors.teal,
    fontWeight: '800',
  },
  timeText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 10,
    color: Theme.colors['gray-400'],
    marginTop: 2,
  },
  promoBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Theme.colors.navy,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoContent: {
    padding: isSmallScreen ? 14 : 20,
  },
  promoTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: isSmallScreen ? 14 : 16,
    color: Theme.colors.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: isSmallScreen ? 11 : 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: isSmallScreen ? 10 : 16,
  },
  promoBtn: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: isSmallScreen ? 14 : 20,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: isSmallScreen ? 12 : 13,
    color: Theme.colors.teal,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 20,
    color: Theme.colors.navy,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-100'],
  },
  modalOptionText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 16,
    color: Theme.colors['gray-600'],
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.teal,
  },
});
