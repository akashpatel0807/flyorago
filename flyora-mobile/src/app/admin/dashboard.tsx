import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList,
  Switch,
  Modal,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuthStore, useToastStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { ShimmerLoading } from '../../components/ShimmerLoading';
import {
  Shield,
  Users,
  User,
  Briefcase,
  DollarSign,
  Activity,
  LogOut,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  ShieldCheck,
  Search,
  BookOpen,
} from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const router = useRouter();
  const { adminToken, adminUsername, adminLogout, isAdminAuthenticated } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);

  // Tab state: 'stats' | 'kyc' | 'users' | 'other'
  const [activeTab, setActiveTab] = useState<'stats' | 'kyc' | 'users' | 'other'>('stats');
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  // Actions states
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // KYC Sheet modal
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Redirect if not authorized
  if (!isAdminAuthenticated) {
    return <Redirect href="/admin/login" />;
  }

  const fetchAdminData = async () => {
    try {
      // Fetch in parallel
      const [statsRes, usersRes, kycRes, bookingsRes, contactsRes] = await Promise.all([
        apiClient.get('/api/admin/stats'),
        apiClient.get('/api/admin/users'),
        apiClient.get('/api/kyc/admin/list'),
        apiClient.get('/api/admin/bookings'),
        apiClient.get('/api/admin/contacts'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data.stats);
      if (usersRes.data?.success) setUsers(usersRes.data.data);
      if (kycRes.data?.success) setKycSubmissions(kycRes.data.data);
      if (bookingsRes.data?.success) setBookings(bookingsRes.data.data);
      if (contactsRes.data?.success) setContacts(contactsRes.data.data);
    } catch (e) {
      console.error('Failed to load administrative lists:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}/status`);
      if (response.data && response.data.success) {
        showToast('User status updated successfully.', 'success');
        // Update state locally
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to toggle status.');
    }
  };

  const handleKycAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      Alert.alert('Validation Error', 'Please input a reason for declining verification.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiClient.post('/api/kyc/admin/action', {
        userId: selectedKyc.userId,
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason.trim() : undefined,
      });

      if (response.data && response.data.success) {
        showToast(`KYC submission ${status.toLowerCase()}!`, 'success');
        setSelectedKyc(null);
        setRejectionReason('');
        setShowRejectInput(false);
        setLoading(true);
        fetchAdminData();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to complete action.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await adminLogout();
    showToast('Logged out of admin panel.', 'info');
    router.replace('/');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.adminTitleRow}>
          <Shield size={20} color={activeColors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.headerTitle, { color: activeColors.navy }]}>Admin Hub</Text>
        </View>
        <Pressable onPress={handleAdminLogout} style={styles.logoutBtn}>
          <LogOut size={18} color={activeColors.error} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: activeColors.border }]}>
        {(['stats', 'kyc', 'users', 'other'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabBtn,
              { borderBottomColor: activeTab === tab ? activeColors.primary : 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? activeColors.primary : activeColors.textSecondary },
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.skeletonContainer}>
          <ShimmerLoading height={100} borderRadius={Radius.large} style={{ marginBottom: 12 }} />
          <ShimmerLoading height={100} borderRadius={Radius.large} style={{ marginBottom: 12 }} />
          <ShimmerLoading height={200} borderRadius={Radius.large} />
        </View>
      ) : (
        <View style={styles.flex1}>
          {/* TAB 1: Stats Grid */}
          {activeTab === 'stats' && (
            <ScrollView contentContainerStyle={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: activeColors.navy }]}>Platform Statistics</Text>
              
              <View style={styles.grid}>
                <GlassCard style={styles.gridCard}>
                  <Users size={20} color={activeColors.primary} style={{ marginBottom: 6 }} />
                  <Text style={[styles.gridVal, { color: activeColors.text }]}>{stats.totalUsers || 0}</Text>
                  <Text style={[styles.gridLabel, { color: activeColors.textSecondary }]}>Total Users</Text>
                </GlassCard>

                <GlassCard style={styles.gridCard}>
                  <ShieldCheck size={20} color={activeColors.success} style={{ marginBottom: 6 }} />
                  <Text style={[styles.gridVal, { color: activeColors.text }]}>{stats.pendingKyc || 0}</Text>
                  <Text style={[styles.gridLabel, { color: activeColors.textSecondary }]}>Pending KYC</Text>
                </GlassCard>

                <GlassCard style={styles.gridCard}>
                  <Briefcase size={20} color={activeColors.accent} style={{ marginBottom: 6 }} />
                  <Text style={[styles.gridVal, { color: activeColors.text }]}>{stats.totalBookings || 0}</Text>
                  <Text style={[styles.gridLabel, { color: activeColors.textSecondary }]}>Bookings</Text>
                </GlassCard>

                <GlassCard style={styles.gridCard}>
                  <DollarSign size={20} color="#10b981" style={{ marginBottom: 6 }} />
                  <Text style={[styles.gridVal, { color: activeColors.text }]}>${stats.totalRevenue?.toFixed(2) || '0.00'}</Text>
                  <Text style={[styles.gridLabel, { color: activeColors.textSecondary }]}>Revenue</Text>
                </GlassCard>
              </View>

              <GlassCard style={styles.activitiesCard}>
                <View style={styles.activitiesHeader}>
                  <Activity size={18} color={activeColors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.activitiesTitle, { color: activeColors.text }]}>Platform Summary</Text>
                </View>
                <View style={styles.activityRow}>
                  <Text style={[styles.actLabel, { color: activeColors.textSecondary }]}>Active Trips Registered:</Text>
                  <Text style={[styles.actVal, { color: activeColors.text }]}>{stats.totalTrips || 0}</Text>
                </View>
                <View style={styles.activityRow}>
                  <Text style={[styles.actLabel, { color: activeColors.textSecondary }]}>Shipments Requested:</Text>
                  <Text style={[styles.actVal, { color: activeColors.text }]}>{stats.totalShipments || 0}</Text>
                </View>
                <View style={styles.activityRow}>
                  <Text style={[styles.actLabel, { color: activeColors.textSecondary }]}>Waitlist signups:</Text>
                  <Text style={[styles.actVal, { color: activeColors.text }]}>{stats.waitlistCount || 0}</Text>
                </View>
              </GlassCard>
            </ScrollView>
          )}

          {/* TAB 2: KYC Submissions */}
          {activeTab === 'kyc' && (
            <FlatList
              data={kycSubmissions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <GlassCard style={styles.kycCard}>
                  <View style={styles.kycCardHeader}>
                    <View>
                      <Text style={[styles.kycNameText, { color: activeColors.text }]}>{item.fullName}</Text>
                      <Text style={[styles.kycEmailText, { color: activeColors.textSecondary }]}>{item.email}</Text>
                    </View>
                    <View style={[styles.pendingBadge, { backgroundColor: item.status === 'PENDING' ? '#fef3c7' : '#d1fae5' }]}>
                      <Text style={[styles.pendingBadgeText, { color: item.status === 'PENDING' ? '#b45309' : '#047857' }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.kycCardBody}>
                    <View style={styles.kycInfoRow}>
                      <FileText size={14} color={activeColors.textSecondary} style={{ marginRight: 6 }} />
                      <Text style={[styles.kycInfoText, { color: activeColors.text }]}>
                        Document: {item.documentType?.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.kycTime}>Submitted: {item.submittedAt ? item.submittedAt.split('T')[0] : ''}</Text>

                    {item.status === 'PENDING' && (
                      <CustomButton
                        title="Review Submissions"
                        onPress={() => setSelectedKyc(item)}
                        variant="outline"
                        size="sm"
                        iconRight={<Eye size={12} color={activeColors.primary} />}
                        style={{ marginTop: 12 }}
                      />
                    )}
                  </View>
                </GlassCard>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <CheckCircle size={38} color={activeColors.success} style={{ marginBottom: 8 }} />
                  <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>No pending KYC requests.</Text>
                </View>
              )}
            />
          )}

          {/* TAB 3: Users Directory */}
          {activeTab === 'users' && (
            <View style={styles.flex1}>
              <CustomInput
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                iconLeft={<Search size={18} color={activeColors.textSecondary} />}
                style={styles.searchBar}
              />

              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <GlassCard style={styles.userCard}>
                    <View style={styles.userCardLeft}>
                      <Text style={[styles.userNameText, { color: activeColors.text }]}>{item.fullName}</Text>
                      <Text style={[styles.userEmailText, { color: activeColors.textSecondary }]}>{item.email}</Text>
                      <Text style={[styles.userRoleText, { color: activeColors.primary }]}>Role: {item.role}</Text>
                    </View>
                    <View style={styles.userCardRight}>
                      <Text style={[styles.toggleText, { color: item.isActive ? activeColors.success : activeColors.textSecondary }]}>
                        {item.isActive ? 'Active' : 'Blocked'}
                      </Text>
                      <Switch
                        value={item.isActive}
                        onValueChange={() => handleToggleUserStatus(item.id, item.isActive)}
                        thumbColor={item.isActive ? activeColors.primary : '#ccc'}
                      />
                    </View>
                  </GlassCard>
                )}
              />
            </View>
          )}

          {/* TAB 4: Other Registries */}
          {activeTab === 'other' && (
            <ScrollView contentContainerStyle={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: activeColors.navy }]}>Platform Bookings</Text>
              {bookings.length > 0 ? (
                bookings.map((b, idx) => (
                  <GlassCard key={idx} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <Text style={[styles.bookingId, { color: activeColors.text }]}>Booking #{b.id.substring(0, 8).toUpperCase()}</Text>
                      <Text style={[styles.bookingStatus, { color: activeColors.primary }]}>{b.status}</Text>
                    </View>
                    <Text style={[styles.bookingRoute, { color: activeColors.textSecondary }]}>
                      Route: {b.fromCity} ➔ {b.toCity}
                    </Text>
                    <Text style={[styles.bookingDetails, { color: activeColors.text }]}>
                      Sender: {b.senderName} | Traveler: {b.travelerName}
                    </Text>
                    <Text style={[styles.bookingAmount, { color: activeColors.success }]}>
                      Total Price: ${b.totalAmount}
                    </Text>
                  </GlassCard>
                ))
              ) : (
                <View style={styles.emptyCardBox}>
                  <Text style={[styles.emptyCardText, { color: activeColors.textSecondary }]}>No active bookings.</Text>
                </View>
              )}

              <Text style={[styles.sectionTitle, { color: activeColors.navy, marginTop: Spacing.four }]}>Waitlist Signups ({stats.waitlistCount || 0})</Text>
              <Text style={[styles.sectionTitle, { color: activeColors.navy, marginTop: Spacing.four }]}>Contact Inquiries ({contacts.length || 0})</Text>
              {contacts.length > 0 ? (
                contacts.map((c, idx) => (
                  <GlassCard key={idx} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <Text style={[styles.bookingId, { color: activeColors.text }]}>{c.name} ({c.userType})</Text>
                      <Text style={[styles.bookingStatus, { color: activeColors.textSecondary }]}>{c.email}</Text>
                    </View>
                    <Text style={[styles.bookingRoute, { color: activeColors.text, fontWeight: '700' }]}>
                      Subject: {c.subject}
                    </Text>
                    <Text style={[styles.bookingDetails, { color: activeColors.textSecondary }]}>
                      "{c.message}"
                    </Text>
                  </GlassCard>
                ))
              ) : (
                <View style={styles.emptyCardBox}>
                  <Text style={[styles.emptyCardText, { color: activeColors.textSecondary }]}>No messages.</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* KYC Review Sheet Modal */}
      <Modal visible={!!selectedKyc} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: activeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: activeColors.text }]}>Review Verification Request</Text>
              <Pressable onPress={() => { setSelectedKyc(null); setShowRejectInput(false); setRejectionReason(''); }}>
                <Text style={[styles.closeText, { color: activeColors.primary }]}>Close</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={[styles.modalSubtitle, { color: activeColors.textSecondary }]}>
                Applicant Name: <Text style={{ color: activeColors.text, fontWeight: '800' }}>{selectedKyc?.fullName}</Text>
              </Text>
              <Text style={[styles.modalSubtitle, { color: activeColors.textSecondary, marginBottom: Spacing.three }]}>
                Document Type: <Text style={{ color: activeColors.text, fontWeight: '800' }}>{selectedKyc?.documentType?.replace('_', ' ').toUpperCase()}</Text>
              </Text>

              {/* Simulated document image visual displays */}
              <View style={styles.docBoxSim}>
                <FileText size={24} color={activeColors.primary} />
                <Text style={[styles.docBoxTextSim, { color: activeColors.text }]}>Front Document Image Payload Loaded</Text>
              </View>

              <View style={styles.docBoxSim}>
                <User size={24} color={activeColors.primary} />
                <Text style={[styles.docBoxTextSim, { color: activeColors.text }]}>Selfie Verification Image Payload Loaded</Text>
              </View>

              {showRejectInput ? (
                <View style={{ marginTop: 12 }}>
                  <CustomInput
                    label="Rejection Reason *"
                    placeholder="e.g. Blurry photo, name mismatch..."
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                  />
                  <View style={styles.decisionRow}>
                    <CustomButton
                      title="Decline Verification"
                      variant="danger"
                      onPress={() => handleKycAction('REJECTED')}
                      loading={actionLoading}
                      style={styles.decisionBtn as any}
                    />
                    <CustomButton
                      title="Back"
                      variant="outline"
                      onPress={() => setShowRejectInput(false)}
                      style={styles.decisionBtn as any}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.decisionRow}>
                  <CustomButton
                    title="Approve Profile"
                    onPress={() => handleKycAction('APPROVED')}
                    loading={actionLoading}
                    style={styles.decisionBtn as any}
                  />
                  <CustomButton
                    title="Reject Request"
                    variant="danger"
                    onPress={() => setShowRejectInput(true)}
                    style={styles.decisionBtn as any}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  adminTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  logoutBtn: {
    padding: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1.5,
    marginBottom: Spacing.two,
  },
  tabBtn: {
    paddingVertical: 12,
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  skeletonContainer: {
    padding: Spacing.four,
  },
  tabContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    padding: 16,
    alignItems: 'flex-start',
    marginVertical: 0,
  },
  gridVal: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  activitiesCard: {
    padding: Spacing.four,
    marginVertical: 0,
  },
  activitiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  activitiesTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  actLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  actVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  kycCard: {
    padding: 16,
    marginBottom: 12,
    marginVertical: 0,
  },
  kycCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  kycNameText: {
    fontSize: 14,
    fontWeight: '800',
  },
  kycEmailText: {
    fontSize: 12,
  },
  pendingBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.round,
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  kycCardBody: {
    paddingTop: 10,
  },
  kycInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycInfoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  kycTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 6,
  },
  emptyContainer: {
    paddingVertical: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.two,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    marginVertical: 0,
  },
  userCardLeft: {
    flex: 1,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '800',
  },
  userEmailText: {
    fontSize: 12,
    marginTop: 2,
  },
  userRoleText: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  userCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  bookingCard: {
    padding: 14,
    marginBottom: 10,
    marginVertical: 0,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
    marginBottom: 8,
  },
  bookingId: {
    fontSize: 13,
    fontWeight: '800',
  },
  bookingStatus: {
    fontSize: 10,
    fontWeight: '900',
  },
  bookingRoute: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookingDetails: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  bookingAmount: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  emptyCardBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radius.large,
    borderColor: '#e2e8f0',
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyCardText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    height: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalScroll: {
    paddingBottom: 24,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  docBoxSim: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: Radius.large,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.01)',
    marginBottom: 12,
  },
  docBoxTextSim: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 12,
  },
  decisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
  },
  decisionBtn: {
    flex: 1,
  },
});
