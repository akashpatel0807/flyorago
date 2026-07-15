import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useToastStore } from '../store';
import { apiClient } from '../services/apiClient';
import { Theme } from '../constants/theme';
import { CustomButton } from '../components/CustomButton';
import {
  Shield,
  FileText,
  User,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Trash2,
  Check,
  ChevronLeft,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const DUMMY_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export default function KycScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { userId, userName } = useAuthStore();

  const [viewMode, setViewMode] = useState<'SUBMIT' | 'STATUS'>('SUBMIT');
  const [kycStatus, setKycStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED'>('NOT_SUBMITTED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState<'national_id' | 'passport'>('national_id');

  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [selfieImage, setSelfieImage] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  const fetchKycStatus = async () => {
    if (!userId) {
      setPageLoading(false);
      return;
    }
    try {
      const response = await apiClient.get(`/api/kyc/status/${userId}`);
      if (response.data && response.data.success) {
        const status = response.data.data.status;
        setKycStatus(status);
        if (status === 'REJECTED') {
          setRejectionReason(response.data.data.rejectionReason || 'Documents did not meet our verification criteria.');
        }
        if (status !== 'NOT_SUBMITTED') {
          setViewMode('STATUS');
        } else {
          setViewMode('SUBMIT');
        }
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, [userId]);

  const handleDocUpload = (side: 'front' | 'back') => {
    showToast(`${side === 'front' ? 'Front' : 'Back'} side selected.`, 'info');
    if (side === 'front') setFrontImage(DUMMY_BASE64_IMAGE);
    if (side === 'back') setBackImage(DUMMY_BASE64_IMAGE);
  };

  const startCamera = () => {
    setCameraActive(true);
  };

  const captureSelfie = () => {
    setSelfieImage(DUMMY_BASE64_IMAGE);
    setCameraActive(false);
    showToast('Selfie captured.', 'info');
  };

  const handleKycSubmit = async () => {
    if (!userId) return;
    setSubmitting(true);
    setSubmitProgress(15);
    try {
      setSubmitProgress(50);
      const response = await apiClient.post('/api/kyc/submit', {
        userId,
        documentType,
        frontImage,
        backImage: backImage || undefined,
        selfieImage,
      });

      setSubmitProgress(90);
      if (response.data && response.data.success) {
        setSubmitProgress(100);
        setTimeout(() => {
          setKycStatus('PENDING');
          setViewMode('STATUS');
          setSubmitting(false);
          showToast('Verification submitted successfully!', 'success');
        }, 500);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Submission Error', error.message || 'Failed to submit verification.');
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setFrontImage('');
    setBackImage('');
    setSelfieImage('');
    setStep(1);
    setViewMode('SUBMIT');
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deniedContainer}>
          <ShieldAlert size={48} color={Theme.colors.teal} />
          <Text style={styles.deniedTitle}>Access Denied</Text>
          <Text style={styles.deniedDesc}>
            Please sign up or log in first before accessing the KYC Verification flow.
          </Text>
          <CustomButton title="Go to Login" onPress={() => router.replace('/(auth)/login')} fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  if (pageLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Theme.colors.teal} />
        <Text style={styles.loadingText}>Securing session...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)' as any)} style={styles.backBtn}>
          <ChevronLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={styles.headerIcon}>
          <Shield size={20} color={Theme.colors.teal} />
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {viewMode === 'SUBMIT' ? (
          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            {/* Steps indicator */}
            <View style={styles.stepsRow}>
              <View>
                <Text style={styles.stepIndicatorText}>STEP {step} OF 3</Text>
                <Text style={styles.stepTitle}>
                  {step === 1 && 'Choose Document Type'}
                  {step === 2 && 'Upload Identification'}
                  {step === 3 && 'Take a Live Selfie'}
                </Text>
              </View>
              <View style={styles.dots}>
                {[1, 2, 3].map((s) => (
                  <View
                    key={s}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: s === step ? Theme.colors.teal : s < step ? Theme.colors['teal-light'] : Theme.colors['gray-200'],
                        width: s === step ? 20 : 6,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* STEP 1 */}
            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.explanationText}>
                  Welcome, <Text style={{ fontWeight: '700' }}>{userName}</Text>. To secure transactions, comply with global shipping regulations, and build traveler trust, please verify your identity.
                </Text>

                <Pressable
                  onPress={() => setDocumentType('national_id')}
                  style={[
                    styles.docOption,
                    documentType === 'national_id' && styles.docOptionActive
                  ]}
                >
                  <View style={[styles.docIconBg, documentType === 'national_id' && styles.docIconBgActive]}>
                    <FileText size={20} color={documentType === 'national_id' ? Theme.colors.white : Theme.colors['gray-500']} />
                  </View>
                  <View style={styles.docText}>
                    <Text style={styles.docOptionTitle}>National ID Card</Text>
                    <Text style={styles.docOptionDesc}>Driving license, Aadhaar card, or government identity card.</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setDocumentType('passport')}
                  style={[
                    styles.docOption,
                    documentType === 'passport' && styles.docOptionActive
                  ]}
                >
                  <View style={[styles.docIconBg, documentType === 'passport' && styles.docIconBgActive]}>
                    <User size={20} color={documentType === 'passport' ? Theme.colors.white : Theme.colors['gray-500']} />
                  </View>
                  <View style={styles.docText}>
                    <Text style={styles.docOptionTitle}>International Passport</Text>
                    <Text style={styles.docOptionDesc}>Passport book bio page showing name, photo and passport number.</Text>
                  </View>
                </Pressable>

                <View style={styles.shieldAlertCard}>
                  <Shield size={18} color={Theme.colors.teal} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={styles.shieldAlertText}>
                    Your identification documents are securely stored using advanced encryption. They are used exclusively for verification and will never be shared.
                  </Text>
                </View>

                <CustomButton title="Continue" onPress={() => setStep(2)} style={styles.actionBtn} />
              </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.explanationText}>
                  Please upload clear, legible photos of your {documentType === 'national_id' ? 'National ID Card' : 'International Passport'}.
                </Text>

                <Text style={styles.fieldLabel}>
                  {documentType === 'national_id' ? 'Front Side of ID (Required)' : 'Passport Bio Page (Required)'}
                </Text>
                {frontImage ? (
                  <View style={styles.previewContainer}>
                    <Text style={styles.previewText}>ID Front Side Loaded</Text>
                    <Pressable onPress={() => setFrontImage('')} style={styles.trashBtn}>
                      <Trash2 size={16} color={Theme.colors.white} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => handleDocUpload('front')} style={styles.uploadBox}>
                    <Upload size={24} color={Theme.colors['gray-500']} />
                    <Text style={styles.uploadBoxText}>Upload Photo</Text>
                  </Pressable>
                )}

                <Text style={[styles.fieldLabel, { marginTop: Theme.spacing.md }]}>Back Side of ID (Optional)</Text>
                {backImage ? (
                  <View style={styles.previewContainer}>
                    <Text style={styles.previewText}>ID Back Side Loaded</Text>
                    <Pressable onPress={() => setBackImage('')} style={styles.trashBtn}>
                      <Trash2 size={16} color={Theme.colors.white} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => handleDocUpload('back')} style={styles.uploadBox}>
                    <Upload size={24} color={Theme.colors['gray-500']} />
                    <Text style={styles.uploadBoxText}>Upload Photo (Optional)</Text>
                  </Pressable>
                )}

                <View style={styles.wizardNav}>
                  <CustomButton title="Back" variant="outline" onPress={() => setStep(1)} style={styles.halfBtn} />
                  <CustomButton title="Continue" onPress={() => setStep(3)} disabled={!frontImage} style={styles.halfBtn} />
                </View>
              </View>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.explanationText}>
                  Please take a live selfie using your device's camera to verify that your face matches the photo on your identification card.
                </Text>

                {cameraActive ? (
                  <View style={styles.cameraFrame}>
                    <View style={styles.cameraOverlay}>
                      <View style={styles.faceOval} />
                    </View>
                    <Pressable onPress={captureSelfie} style={styles.captureBtn}>
                      <Camera size={24} color={Theme.colors.teal} />
                    </Pressable>
                  </View>
                ) : selfieImage ? (
                  <View style={styles.selfiePreviewFrame}>
                    <CheckCircle size={38} color={Theme.colors.teal} style={{ marginBottom: 12 }} />
                    <Text style={styles.selfiePreviewText}>Selfie Loaded Successfully</Text>
                    <CustomButton title="Retake Photo" variant="outline" onPress={() => setSelfieImage('')} style={{ marginTop: 12 }} />
                  </View>
                ) : (
                  <Pressable onPress={startCamera} style={styles.cameraPlaceholderBox}>
                    <Camera size={38} color={Theme.colors['gray-400']} style={{ marginBottom: 10 }} />
                    <Text style={styles.cameraPlaceholderTitle}>Open Camera View</Text>
                    <Text style={styles.cameraPlaceholderDesc}>Requires camera permission</Text>
                  </Pressable>
                )}

                <View style={styles.wizardNav}>
                  <CustomButton title="Back" variant="outline" onPress={() => setStep(2)} style={styles.halfBtn} />
                  <CustomButton title="Submit KYC" onPress={handleKycSubmit} disabled={!selfieImage} style={styles.halfBtn} />
                </View>
              </View>
            )}

            {submitting && (
              <View style={styles.progressOverlay}>
                <ActivityIndicator size="large" color={Theme.colors.teal} />
                <Text style={styles.progressTitle}>Uploading Documents</Text>
                <Text style={styles.progressDesc}>Encrypting document payloads with SSL (256-bit)</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${submitProgress}%` }]} />
                </View>
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.duration(500)} style={styles.statusContainer}>
            {kycStatus === 'PENDING' && (
              <View style={styles.statusBox}>
                <View style={[styles.statusIconBg, { backgroundColor: '#FEF3C7' }]}>
                  <Shield size={38} color="#D97706" />
                </View>
                <Text style={styles.statusTitle}>Verification Under Review</Text>
                <Text style={styles.statusDesc}>
                  Our compliance team is currently reviewing your identity documents. This verification typically takes a few minutes. We will update you here.
                </Text>
                <View style={[styles.statusNotice, { backgroundColor: '#FEF3C7' }]}>
                  <ShieldAlert size={16} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={[styles.statusNoticeText, { color: '#B45309' }]}>
                    While under review, you cannot publish new trips or matching shipments.
                  </Text>
                </View>
              </View>
            )}

            {kycStatus === 'APPROVED' && (
              <View style={styles.statusBox}>
                <View style={[styles.statusIconBg, { backgroundColor: '#D1FAE5' }]}>
                  <CheckCircle size={38} color="#059669" />
                </View>
                <View style={styles.approvedBadge}>
                  <Check size={12} color="#047857" style={{ marginRight: 4 }} />
                  <Text style={styles.approvedBadgeText}>Verified</Text>
                </View>
                <Text style={styles.statusTitle}>Verification Approved!</Text>
                <Text style={styles.statusDesc}>
                  Congratulations, {userName}. Your KYC verification was successful. You are now a trusted and verified member of the Flyorago marketplace.
                </Text>
                <CustomButton title="Go to Dashboard" onPress={() => router.replace('/(tabs)' as any)} style={{ marginTop: 24 }} />
              </View>
            )}

            {kycStatus === 'REJECTED' && (
              <View style={styles.statusBox}>
                <View style={[styles.statusIconBg, { backgroundColor: '#FEE2E2' }]}>
                  <AlertCircle size={38} color="#DC2626" />
                </View>
                <Text style={styles.statusTitle}>Verification Declined</Text>
                <Text style={styles.statusDesc}>
                  We were unable to approve your KYC verification because:
                </Text>
                <View style={[styles.rejectionReasonBox, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.rejectionReasonText, { color: '#991B1B' }]}>"{rejectionReason}"</Text>
                </View>
                <CustomButton title="Retry Verification" onPress={handleRetry} style={{ marginTop: 24 }} />
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors['gray-50'],
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-200'],
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.navy,
  },
  headerIcon: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
  },
  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  deniedTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Theme.colors.navy,
    marginTop: 16,
    marginBottom: 6,
  },
  deniedDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors['gray-600'],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors['gray-600'],
    marginTop: 12,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  stepIndicatorText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: Theme.colors.teal,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Theme.colors.navy,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  stepContainer: {
    width: '100%',
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius['2xl'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  explanationText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: Theme.colors['gray-600'],
    marginBottom: Theme.spacing.lg,
  },
  docOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors['gray-200'],
    borderRadius: Theme.borderRadius.xl,
    padding: 16,
    marginBottom: 14,
    backgroundColor: Theme.colors.white,
  },
  docOptionActive: {
    borderColor: Theme.colors.teal,
    backgroundColor: '#F0FDFA', // teal lightest
  },
  docIconBg: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors['gray-100'],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  docIconBgActive: {
    backgroundColor: Theme.colors.teal,
  },
  docText: {
    flex: 1,
  },
  docOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.navy,
  },
  docOptionDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors['gray-500'],
    marginTop: 2,
    lineHeight: 18,
  },
  shieldAlertCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: Theme.borderRadius.xl,
    marginVertical: 14,
    backgroundColor: '#F0FDFA',
  },
  shieldAlertText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
    color: Theme.colors['teal-dark'],
  },
  actionBtn: {
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.navy,
    marginBottom: 10,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Theme.colors['gray-300'],
    borderRadius: Theme.borderRadius.xl,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors['gray-50'],
  },
  uploadBoxText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors['gray-700'],
    marginTop: 8,
  },
  previewContainer: {
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
    borderRadius: Theme.borderRadius.xl,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors['gray-50'],
    position: 'relative',
  },
  previewText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.teal,
  },
  trashBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: Theme.borderRadius.round,
  },
  wizardNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xl,
    gap: 16,
  },
  halfBtn: {
    flex: 1,
  },
  cameraFrame: {
    borderWidth: 3,
    borderColor: Theme.colors.navy,
    borderRadius: Theme.borderRadius['2xl'],
    height: 300,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  faceOval: {
    width: 200,
    height: 260,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Theme.colors.white,
    borderStyle: 'dashed',
  },
  captureBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  selfiePreviewFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    borderRadius: Theme.borderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Theme.colors['gray-200'],
    backgroundColor: Theme.colors['gray-50'],
  },
  selfiePreviewText: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.navy,
  },
  cameraPlaceholderBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Theme.colors['gray-300'],
    borderRadius: Theme.borderRadius['2xl'],
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors['gray-50'],
  },
  cameraPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.navy,
  },
  cameraPlaceholderDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors['gray-500'],
    marginTop: 4,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    zIndex: 20,
    borderRadius: Theme.borderRadius['2xl'],
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.navy,
    marginTop: 16,
  },
  progressDesc: {
    fontSize: 13,
    color: Theme.colors['gray-600'],
    marginTop: 6,
    textAlign: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: Theme.colors['gray-200'],
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Theme.colors.teal,
  },
  statusContainer: {
    paddingVertical: Theme.spacing.lg,
  },
  statusBox: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius['2xl'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statusIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    color: Theme.colors.navy,
  },
  statusDesc: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    color: Theme.colors['gray-600'],
  },
  statusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Theme.borderRadius.xl,
    marginTop: 24,
    width: '100%',
  },
  statusNoticeText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.round,
    marginBottom: 12,
  },
  approvedBadgeText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rejectionReasonBox: {
    padding: 16,
    borderRadius: Theme.borderRadius.xl,
    marginTop: 20,
    width: '100%',
  },
  rejectionReasonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
