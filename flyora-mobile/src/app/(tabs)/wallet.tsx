import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  ArrowLeft,
  ShieldCheck,
  EyeOff,
  Copy,
  ChevronRight,
  Download,
  Upload,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  List,
  Wallet as WalletIcon,
} from 'lucide-react-native';

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Today, 10:00 AM';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export default function WalletScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [walletStats, setWalletStats] = useState({
    walletBalance: 0,
    escrowBalance: 0,
    lifetimeEarnings: 0,
    moneyIn: 0,
    moneyOut: 0,
    cashback: 0,
    transactionsCount: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchWalletDetails = async () => {
    if (!userId) return;
    try {
      const response = await apiClient.get(`/api/dashboard/overview/${userId}`);
      let txns = [];
      let stats = {
        walletBalance: 0,
        escrowBalance: 0,
        lifetimeEarnings: 28750.50, // mock lifetime
        moneyIn: 8750,
        moneyOut: 6300,
        cashback: 250,
        transactionsCount: 12,
      };

      if (response.data && response.data.success) {
        const data = response.data.data;
        stats.walletBalance = data.stats?.walletBalance || 0;
        stats.escrowBalance = data.stats?.escrowBalance || 0;
        
        if (data.transactions && data.transactions.length > 0) {
          txns = data.transactions;
        } else {
          // Derive transactions from shipments if none exist
          const shipmentsRes = await apiClient.get(`/api/dashboard/shipments/${userId}`);
          if (shipmentsRes.data && shipmentsRes.data.success) {
            const shipmentsList = shipmentsRes.data.data ?? [];
            txns = shipmentsList.map((s: any, idx: number) => ({
              id: s._id || idx.toString(),
              type: s.status === 'DELIVERED' ? 'credit' : 'debit',
              title: s.status === 'DELIVERED' ? 'Payment Received' : 'Shipment Payment',
              subtitle: s.status === 'DELIVERED' ? `From ${s.title}` : `For ${s.title}`,
              amount: Number(s.pricePaid || 0),
              status: 'Success',
              date: s.createdAt || new Date().toISOString(),
              iconType: s.status === 'DELIVERED' ? 'credit' : 'debit'
            }));
            
            stats.transactionsCount = txns.length;
          }
        }
      }
      
      setWalletStats(stats);
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load wallet stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [userId]);

  const totalBalance = walletStats.walletBalance + walletStats.escrowBalance;

  const renderTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return (
          <View style={[styles.txIconBox, { backgroundColor: '#E6F4F1' }]}>
            <ArrowDownLeft size={20} color={Theme.colors.teal} />
          </View>
        );
      case 'debit':
        return (
          <View style={[styles.txIconBox, { backgroundColor: '#FEE2E2' }]}>
            <ArrowUpRight size={20} color="#EF4444" />
          </View>
        );
      case 'cashback':
        return (
          <View style={[styles.txIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Gift size={20} color="#F59E0B" />
          </View>
        );
      default:
        return (
          <View style={[styles.txIconBox, { backgroundColor: '#EFF6FF' }]}>
            <List size={20} color="#3B82F6" />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <Text style={styles.headerSubtitle}>Manage your money & transactions</Text>
        </View>
        <View style={styles.secureBadge}>
          <ShieldCheck size={14} color={Theme.colors.teal} style={{ marginRight: 4 }} />
          <Text style={styles.secureText}>Secure Wallet</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Wallet Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mainCardContainer}>
          <View
            style={[styles.mainCard, { backgroundColor: '#135A4A' }]}
          >
            <View style={styles.mainCardTop}>
              <View>
                <Text style={styles.availableLabel}>Available Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <Text style={styles.balanceTextMain}>{Math.floor(walletStats.walletBalance).toLocaleString('en-IN')}</Text>
                  <Text style={styles.balanceTextDecimal}>.{(walletStats.walletBalance % 1).toFixed(2).substring(2)}</Text>
                  <Pressable style={styles.eyeBtn}>
                    <EyeOff size={16} color="rgba(255,255,255,0.6)" />
                  </Pressable>
                </View>
                <View style={styles.walletIdRow}>
                  <Text style={styles.walletIdText}>Wallet ID: FLY123456789</Text>
                  <Copy size={12} color="rgba(255,255,255,0.8)" style={{ marginLeft: 6 }} />
                </View>
              </View>
              {/* Graphic Placeholder */}
              <View style={styles.walletGraphic}>
                <WalletIcon size={48} color="rgba(255,255,255,0.2)" />
              </View>
            </View>

            <View style={styles.mainCardBottom}>
              <View style={styles.bottomStat}>
                <Text style={styles.bottomStatLabel}>Total Balance</Text>
                <Text style={styles.bottomStatValue}>₹{formatCurrency(totalBalance)}</Text>
              </View>
              <View style={styles.bottomStat}>
                <Text style={styles.bottomStatLabel}>On Hold ⓘ</Text>
                <Text style={styles.bottomStatValue}>₹{formatCurrency(walletStats.escrowBalance)}</Text>
              </View>
              <View style={styles.bottomStatRight}>
                <Text style={styles.bottomStatLabel}>Lifetime Earnings</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.bottomStatValue}>₹{formatCurrency(walletStats.lifetimeEarnings)}</Text>
                  <ChevronRight size={14} color={Theme.colors.white} style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.actionRow}>
          <Pressable style={styles.actionCard}>
            <View style={[styles.actionIconBox, { backgroundColor: '#E6F4F1' }]}>
              <Download size={20} color={Theme.colors.teal} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Add Money</Text>
              <Text style={styles.actionSubtitle}>Add money to wallet</Text>
            </View>
            <ChevronRight size={16} color={Theme.colors['gray-400']} />
          </Pressable>

          <Pressable style={styles.actionCard}>
            <View style={[styles.actionIconBox, { backgroundColor: '#E6F4F1' }]}>
              <Upload size={20} color={Theme.colors.teal} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Withdraw</Text>
              <Text style={styles.actionSubtitle}>Transfer to bank</Text>
            </View>
            <ChevronRight size={16} color={Theme.colors['gray-400']} />
          </Pressable>
        </Animated.View>

        {/* Wallet Overview */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.overviewSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wallet Overview</Text>
            <Pressable style={styles.monthSelector}>
              <Text style={styles.monthText}>This Month</Text>
              <ChevronRight size={14} color={Theme.colors['gray-500']} style={{ transform: [{ rotate: '90deg' }] }} />
            </Pressable>
          </View>

          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#E6F4F1' }]}>
                <ArrowDownLeft size={16} color={Theme.colors.teal} />
              </View>
              <View>
                <Text style={styles.overviewVal}>₹{walletStats.moneyIn.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Money In</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#FEE2E2' }]}>
                <ArrowUpRight size={16} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.overviewVal}>₹{walletStats.moneyOut.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Money Out</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#FEF3C7' }]}>
                <Gift size={16} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.overviewVal}>₹{walletStats.cashback.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Cashback Earned</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#EFF6FF' }]}>
                <List size={16} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.overviewVal}>{walletStats.transactionsCount}</Text>
                <Text style={styles.overviewLabel}>Transactions</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Promo Banner */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.promoBannerContainer}>
          <View
            style={[styles.promoBanner, { backgroundColor: '#135A4A' }]}
          >
            <View style={styles.promoTextCol}>
              <Text style={styles.promoTitle}>Invite Friends & Earn</Text>
              <Text style={styles.promoSubtitle}>Invite your friends and earn exciting rewards!</Text>
              <Pressable style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Invite Now</Text>
              </Pressable>
            </View>
            <View style={styles.promoImagePlaceholder}>
              <Gift size={64} color="rgba(255,255,255,0.15)" />
            </View>
          </View>
        </Animated.View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Pressable>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.teal} style={{ marginTop: 20 }} />
        ) : transactions.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <List size={32} color={Theme.colors['gray-300']} />
            </View>
            <Text style={styles.emptyTitle}>No recent transactions</Text>
            <Text style={styles.emptySubtitle}>Your transaction history will appear here.</Text>
          </Animated.View>
        ) : (
          transactions.map((tx, index) => (
            <Animated.View key={tx.id || index} entering={FadeInDown.delay(450 + index * 50)} style={styles.txCard}>
              {renderTransactionIcon(tx.iconType || tx.type)}
              <View style={styles.txDetails}>
                <View style={styles.txRow}>
                  <Text style={styles.txTitle} numberOfLines={1}>{tx.title || 'Transaction'}</Text>
                  <Text style={[styles.txAmount, { color: tx.type === 'credit' ? Theme.colors.teal : Theme.colors.navy }]}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{formatCurrency(tx.amount)}
                  </Text>
                </View>
                <View style={styles.txRow}>
                  <Text style={styles.txSubtitle} numberOfLines={1}>{tx.subtitle || 'Details'}</Text>
                  <View style={styles.txMetaRow}>
                    <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                    <View style={styles.successBadge}>
                      <Text style={styles.successText}>Success</Text>
                    </View>
                  </View>
                </View>
              </View>
              <ChevronRight size={16} color={Theme.colors['gray-400']} style={{ marginLeft: 8 }} />
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
    backgroundColor: '#F7FBFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 24,
    color: Theme.colors.navy,
  },
  headerSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  secureText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: Theme.colors.teal,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainCardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  mainCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  availableLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currencySymbol: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 24,
    color: Theme.colors.white,
    marginRight: 2,
  },
  balanceTextMain: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 36,
    color: Theme.colors.white,
    letterSpacing: -1,
  },
  balanceTextDecimal: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.white,
  },
  eyeBtn: {
    marginLeft: 12,
    paddingBottom: 4,
  },
  walletIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  walletIdText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  walletGraphic: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  mainCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
  },
  bottomStat: {
    flex: 1,
  },
  bottomStatRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bottomStatLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  bottomStatValue: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 10,
    color: Theme.colors['gray-500'],
  },
  overviewSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors.navy,
    marginRight: 4,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  overviewItem: {
    width: '48%',
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
  },
  overviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  overviewVal: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
  },
  overviewLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-500'],
  },
  promoBannerContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  promoBanner: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  promoTextCol: {
    flex: 1,
    padding: 20,
    paddingRight: 80,
    justifyContent: 'center',
  },
  promoTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  promoBtn: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 12,
    color: Theme.colors.teal,
  },
  promoImagePlaceholder: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors.navy,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txDetails: {
    flex: 1,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  txTitle: {
    flex: 1,
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    marginRight: 8,
  },
  txAmount: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 15,
  },
  txSubtitle: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
    marginRight: 8,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txDate: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-400'],
    marginRight: 8,
  },
  successBadge: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  successText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 10,
    color: Theme.colors.teal,
  },
});
