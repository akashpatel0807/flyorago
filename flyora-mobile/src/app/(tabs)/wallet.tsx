import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380 || height < 700;
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ShieldCheck,
  Eye,
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
  const [showBalance, setShowBalance] = useState(true);
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

  // Modal and transaction states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleAddMoney = async () => {
    const amt = Number(amountInput);
    if (!amountInput || isNaN(amt) || amt <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiClient.post('/api/dashboard/wallet/topup', {
        userId,
        amount: amt,
        description: 'Direct Wallet Payout Top-up',
      });

      if (response.data && response.data.success) {
        alert(`Successfully added ₹${amt.toFixed(2)} to your wallet!`);
        setAmountInput('');
        setShowAddModal(false);
        fetchWalletDetails();
      } else {
        alert(response.data.message || 'Failed to add money.');
      }
    } catch (error: any) {
      console.error('Failed to add money:', error);
      alert(error.response?.data?.message || 'Error occurred while adding money.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = Number(amountInput);
    if (!amountInput || isNaN(amt) || amt <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    if (amt > walletStats.walletBalance) {
      alert(`Insufficient balance. You only have ₹${walletStats.walletBalance.toFixed(2)} in your wallet.`);
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiClient.post('/api/dashboard/wallet/withdraw', {
        userId,
        amount: amt,
        description: 'Direct Wallet Bank Withdrawal',
      });

      if (response.data && response.data.success) {
        alert(`Successfully withdrew ₹${amt.toFixed(2)} from your wallet!`);
        setAmountInput('');
        setShowWithdrawModal(false);
        fetchWalletDetails();
      } else {
        alert(response.data.message || 'Failed to withdraw money.');
      }
    } catch (error: any) {
      console.error('Failed to withdraw money:', error);
      alert(error.response?.data?.message || 'Error occurred while withdrawing money.');
    } finally {
      setActionLoading(false);
    }
  };

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
          <View style={[styles.txIconBox, { backgroundColor: '#D1FAE5' }]}>
            <ArrowDownLeft size={20} color="#065F46" />
          </View>
        );
      case 'debit':
        return (
          <View style={[styles.txIconBox, { backgroundColor: '#FEE2E2' }]}>
            <ArrowUpRight size={20} color="#991B1B" />
          </View>
        );
      case 'cashback':
        return (
          <View style={[styles.txIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Gift size={20} color="#D97706" />
          </View>
        );
      default:
        return (
          <View style={[styles.txIconBox, { backgroundColor: '#EFF6FF' }]}>
            <List size={20} color="#1E40AF" />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={22} color={Theme.colors.navy} />
        </Pressable>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <Text style={styles.headerSubtitle}>Manage your money & transactions</Text>
        </View>
        <View style={styles.secureBadge}>
          <ShieldCheck size={14} color={Theme.colors.teal} style={{ marginRight: 4 }} />
          <Text style={styles.secureText}>Secure</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Wallet Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mainCardContainer}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.mainCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.mainCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.availableLabel}>Available Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <Text style={styles.balanceTextMain}>
                    {showBalance ? Math.floor(walletStats.walletBalance).toLocaleString('en-IN') : '••••'}
                  </Text>
                  {showBalance && (
                    <Text style={styles.balanceTextDecimal}>.{(walletStats.walletBalance % 1).toFixed(2).substring(2)}</Text>
                  )}
                  <Pressable style={styles.eyeBtn} onPress={() => setShowBalance(!showBalance)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showBalance ? (
                      <EyeOff size={18} color="rgba(255,255,255,0.6)" />
                    ) : (
                      <Eye size={18} color="rgba(255,255,255,0.6)" />
                    )}
                  </Pressable>
                </View>
                <View style={styles.walletIdRow}>
                  <Text style={styles.walletIdText}>Wallet ID: FLY123456789</Text>
                  <Copy size={11} color="rgba(255,255,255,0.8)" style={{ marginLeft: 6 }} />
                </View>
              </View>
              {/* Graphic Placeholder */}
              <View style={styles.walletGraphic}>
                <WalletIcon size={52} color="rgba(255,255,255,0.06)" />
              </View>
            </View>

            <View style={styles.mainCardBottom}>
              <View style={styles.bottomStat}>
                <Text style={styles.bottomStatLabel}>Total Balance</Text>
                <Text style={styles.bottomStatValue}>₹{showBalance ? formatCurrency(totalBalance) : '••••'}</Text>
              </View>
              <View style={styles.bottomStat}>
                <Text style={styles.bottomStatLabel}>On Hold ⓘ</Text>
                <Text style={styles.bottomStatValue}>₹{showBalance ? formatCurrency(walletStats.escrowBalance) : '••••'}</Text>
              </View>
              <View style={styles.bottomStatRight}>
                <Text style={styles.bottomStatLabel}>Lifetime Earnings</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.bottomStatValue}>₹{showBalance ? formatCurrency(walletStats.lifetimeEarnings) : '••••'}</Text>
                  <ChevronRight size={12} color={Theme.colors.white} style={{ marginLeft: 2 }} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.actionRow}>
          <Pressable 
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.cardPressedEffect
            ]} 
            onPress={() => { setShowAddModal(true); setAmountInput(''); }}
          >
            <LinearGradient
              colors={['#E6F4F1', '#D1EAE6']}
              style={styles.actionIconBox}
            >
              <Download size={18} color={Theme.colors.teal} />
            </LinearGradient>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Add Money</Text>
              <Text style={styles.actionSubtitle}>Add funds to wallet</Text>
            </View>
            <ChevronRight size={14} color={Theme.colors['gray-400']} />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.cardPressedEffect
            ]} 
            onPress={() => { setShowWithdrawModal(true); setAmountInput(''); }}
          >
            <LinearGradient
              colors={['#E6F4F1', '#D1EAE6']}
              style={styles.actionIconBox}
            >
              <Upload size={18} color={Theme.colors.teal} />
            </LinearGradient>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Withdraw</Text>
              <Text style={styles.actionSubtitle}>Transfer to bank</Text>
            </View>
            <ChevronRight size={14} color={Theme.colors['gray-400']} />
          </Pressable>
        </Animated.View>

        {/* Wallet Overview */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.overviewSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Wallet Overview</Text>
            <Pressable style={styles.monthSelector}>
              <Text style={styles.monthText}>This Month</Text>
              <ChevronRight size={14} color={Theme.colors.navy} style={{ transform: [{ rotate: '90deg' }] }} />
            </Pressable>
          </View>

          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#D1FAE5' }]}>
                <ArrowDownLeft size={16} color="#065F46" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.overviewVal}>₹{walletStats.moneyIn.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Money In</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#FEE2E2' }]}>
                <ArrowUpRight size={16} color="#991B1B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.overviewVal}>₹{walletStats.moneyOut.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Money Out</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#FEF3C7' }]}>
                <Gift size={16} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.overviewVal}>₹{walletStats.cashback.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Cashback</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#EFF6FF' }]}>
                <List size={16} color="#1E40AF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.overviewVal}>{walletStats.transactionsCount}</Text>
                <Text style={styles.overviewLabel}>Transactions</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Promo Banner */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.promoBannerContainer}>
          <LinearGradient
            colors={['#0D9488', '#0F766E']}
            style={styles.promoBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.promoTextCol}>
              <Text style={styles.promoTitle}>Invite Friends & Earn</Text>
              <Text style={styles.promoSubtitle}>Invite your friends and earn exciting rewards on Flyorago!</Text>
              <Pressable style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Invite Now</Text>
              </Pressable>
            </View>
            <View style={styles.promoImagePlaceholder}>
              <Gift size={56} color="rgba(255,255,255,0.15)" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Recent Transactions Section Header */}
        <View style={styles.sectionHeaderRow}>
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
          transactions.map((tx, index) => {
            const isCredit = tx.type === 'credit';
            const textValColor = isCredit ? '#065F46' : Theme.colors.navy;
            return (
              <Animated.View key={tx.id || index} entering={FadeInDown.delay(300 + index * 50)}>
                <Pressable 
                  style={({ pressed }) => [
                    styles.txCard,
                    pressed && styles.cardPressedEffect
                  ]}
                >
                  {renderTransactionIcon(tx.iconType || tx.type)}
                  <View style={styles.txDetails}>
                    <View style={styles.txRow}>
                      <Text style={styles.txTitle} numberOfLines={1}>{tx.title || 'Transaction'}</Text>
                      <Text style={[styles.txAmount, { color: textValColor }]}>
                        {isCredit ? '+' : '-'} ₹{formatCurrency(tx.amount)}
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
                  <ChevronRight size={14} color={Theme.colors['gray-400']} style={{ marginLeft: 6 }} />
                </Pressable>
              </Animated.View>
            );
          })
        )}

      </ScrollView>

      {/* Add Money Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.headerRow}>
              <Text style={modalStyles.modalTitle}>Add Money</Text>
              <Pressable onPress={() => setShowAddModal(false)} style={modalStyles.closeBtn}>
                <Text style={modalStyles.closeText}>✕</Text>
              </Pressable>
            </View>
            <Text style={modalStyles.modalDesc}>Enter amount to add to your Flyorago wallet.</Text>
            <View style={modalStyles.inputWrapper}>
              <Text style={modalStyles.currencyPrefix}>₹</Text>
              <TextInput
                style={modalStyles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Theme.colors['gray-400']}
                keyboardType="numeric"
                autoFocus={true}
                value={amountInput}
                onChangeText={setAmountInput}
              />
            </View>
            <Pressable
              style={({ pressed }) => [
                modalStyles.submitBtn,
                (actionLoading) && { opacity: 0.7 },
                pressed && modalStyles.buttonPressedEffect
              ]}
              onPress={handleAddMoney}
              disabled={actionLoading}
            >
              <LinearGradient
                colors={['#0D9488', '#0F766E']}
                style={modalStyles.gradientBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={Theme.colors.white} />
                ) : (
                  <Text style={modalStyles.submitBtnText}>Add Money</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Withdraw Money Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.headerRow}>
              <Text style={modalStyles.modalTitle}>Withdraw Money</Text>
              <Pressable onPress={() => setShowWithdrawModal(false)} style={modalStyles.closeBtn}>
                <Text style={modalStyles.closeText}>✕</Text>
              </Pressable>
            </View>
            <Text style={modalStyles.modalDesc}>Enter amount to transfer to your linked bank account.</Text>
            <Text style={modalStyles.availableLimitText}>Available: ₹{formatCurrency(walletStats.walletBalance)}</Text>
            
            <View style={[modalStyles.inputWrapper, Number(amountInput) > walletStats.walletBalance && modalStyles.inputWrapperError]}>
              <Text style={modalStyles.currencyPrefix}>₹</Text>
              <TextInput
                style={modalStyles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Theme.colors['gray-400']}
                keyboardType="numeric"
                autoFocus={true}
                value={amountInput}
                onChangeText={setAmountInput}
              />
            </View>

            {Number(amountInput) > walletStats.walletBalance && (
              <Text style={modalStyles.errorText}>Amount exceeds your available balance</Text>
            )}

            <Pressable
              style={({ pressed }) => [
                modalStyles.submitBtn,
                (actionLoading || Number(amountInput) > walletStats.walletBalance) && { opacity: 0.5 },
                pressed && modalStyles.buttonPressedEffect
              ]}
              onPress={handleWithdraw}
              disabled={actionLoading || Number(amountInput) > walletStats.walletBalance}
            >
              <LinearGradient
                colors={['#0D9488', '#0F766E']}
                style={modalStyles.gradientBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={Theme.colors.white} />
                ) : (
                  <Text style={modalStyles.submitBtnText}>Withdraw Money</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Modal stylesheet
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: isSmallScreen ? 18 : 20,
    color: Theme.colors.navy,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    color: Theme.colors['gray-600'],
    fontWeight: 'bold',
  },
  modalDesc: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: isSmallScreen ? 12 : 13,
    color: Theme.colors['gray-500'],
    marginBottom: 16,
    lineHeight: 18,
  },
  availableLimitText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: isSmallScreen ? 12 : 13,
    color: Theme.colors.teal,
    marginBottom: 12,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: isSmallScreen ? 48 : 56,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  currencyPrefix: {
    fontSize: isSmallScreen ? 20 : 24,
    color: Theme.colors.navy,
    fontFamily: Theme.typography.h2.fontFamily,
    marginRight: 8,
    fontWeight: '800',
  },
  amountInput: {
    flex: 1,
    fontSize: isSmallScreen ? 20 : 24,
    color: Theme.colors.navy,
    fontFamily: Theme.typography.h2.fontFamily,
    padding: 0,
    fontWeight: '800',
  },
  errorText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: '#EF4444',
    marginTop: -10,
    marginBottom: 16,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    height: isSmallScreen ? 46 : 52,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: isSmallScreen ? 14 : 15,
    color: Theme.colors.white,
    fontWeight: '800',
  },
  buttonPressedEffect: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});

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
    backgroundColor: '#F7FBFA',
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: isSmallScreen ? 20 : 24,
    color: Theme.colors.navy,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: isSmallScreen ? 12 : 13,
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
    fontSize: 10,
    color: Theme.colors.teal,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainCardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  mainCard: {
    padding: isSmallScreen ? 16 : 24,
  },
  mainCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 16 : 24,
  },
  availableLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: isSmallScreen ? 11 : 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currencySymbol: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: isSmallScreen ? 20 : 24,
    color: Theme.colors.white,
    marginRight: 2,
    fontWeight: '800',
  },
  balanceTextMain: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: isSmallScreen ? 30 : 36,
    color: Theme.colors.white,
    letterSpacing: -1,
    fontWeight: '800',
  },
  balanceTextDecimal: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: isSmallScreen ? 15 : 18,
    color: Theme.colors.white,
    fontWeight: '700',
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
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
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
    fontSize: isSmallScreen ? 9 : 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  bottomStatValue: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: isSmallScreen ? 11 : 13,
    color: Theme.colors.white,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: isSmallScreen ? 8 : 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: isSmallScreen ? 10 : 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: isSmallScreen ? 12 : 14,
    color: Theme.colors.navy,
    fontWeight: '800',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 9,
    color: Theme.colors['gray-500'],
    fontWeight: '600',
  },
  cardPressedEffect: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  overviewSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.navy,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors.teal,
    marginRight: 4,
    fontWeight: '700',
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
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
  },
  overviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  overviewVal: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    fontWeight: '800',
  },
  overviewLabel: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 10,
    color: Theme.colors['gray-500'],
    fontWeight: '700',
  },
  promoBannerContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  promoBanner: {
    flexDirection: 'row',
    position: 'relative',
  },
  promoTextCol: {
    flex: 1,
    padding: 20,
    paddingRight: 80,
    justifyContent: 'center',
  },
  promoTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  promoBtn: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 12,
    color: Theme.colors.teal,
    fontWeight: '800',
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
    color: Theme.colors.teal,
    fontWeight: '700',
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
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    fontWeight: '800',
  },
  txAmount: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  txSubtitle: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
    marginRight: 8,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  successBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  successText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 10,
    color: '#065F46',
    fontWeight: '700',
  },
});
