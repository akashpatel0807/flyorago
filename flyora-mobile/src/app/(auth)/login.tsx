import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useToastStore } from '../../store';
import { apiClient, setApiBaseUrl, LOCAL_API_URL } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import { ArrowLeft, User, Lock, Eye, EyeOff, Server } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const loginUserStore = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState('');

  const handleConfigureServer = () => {
    const currentUrl = apiClient.defaults.baseURL || '';
    setTempApiUrl(currentUrl);
    setShowConfigModal(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiClient.post('/api/auth/login', {
        email: email.trim(),
        password,
      });

      const resData = response.data;
      if (resData.success && resData.data) {
        await loginUserStore(
          resData.data.userId,
          resData.data.fullName,
          resData.data.email,
          resData.data.role || 'user'
        );
        showToast(`Welcome back, ${resData.data.fullName}!`, 'success');
        if (resData.data.role === 'admin' || resData.data.email === 'admin@flyorago.com') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/(tabs)' as any);
        }
      } else {
        setErrorMsg(resData.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          
          {/* Header & Image Section */}
          <View style={styles.topSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color={Theme.colors.navy} />
              </Pressable>
              
              <Pressable onPress={handleConfigureServer} style={styles.configBtn}>
                <Server size={22} color={Theme.colors.navy} />
              </Pressable>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>
                Welcome <Text style={{ color: Theme.colors.teal }}>Back</Text>
              </Text>
              <Text style={styles.subtitle}>
                Login to continue shipping{'\n'}smarter with Flyorago.
              </Text>
            </View>

            {/* User uploaded image used across screens */}
            <Image 
              source={require('../../../assets/images/girl1.png')} 
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.formCard}>
            
            {errorMsg ? (
              <View style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Phone Number</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email or phone"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? (
                    <Eye size={18} color={Theme.colors['gray-400']} />
                  ) : (
                    <EyeOff size={18} color={Theme.colors['gray-400']} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable 
              style={styles.forgotBtn} 
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Pressable 
              style={[styles.loginBtn, loading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </Pressable>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </Pressable>
            </View>
            
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Server API Configuration Modal */}
      <Modal
        visible={showConfigModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Server size={22} color={Theme.colors.navy} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>API Server URL</Text>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter your backend server's URL. If testing on local Wi-Fi, enter your PC's IP (e.g., http://192.168.0.121:5000).
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Server Address</Text>
              <TextInput
                style={styles.modalInput}
                value={tempApiUrl}
                onChangeText={setTempApiUrl}
                placeholder="http://192.168.0.121:5000"
                placeholderTextColor={Theme.colors['gray-400']}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            <View style={styles.modalActionRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => {
                  setTempApiUrl(LOCAL_API_URL);
                }}
              >
                <Text style={styles.modalBtnTextSecondary}>Reset to Default</Text>
              </Pressable>
            </View>

            <View style={[styles.modalActionRow, { marginTop: 12 }]}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowConfigModal(false)}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={async () => {
                  if (tempApiUrl.trim()) {
                    await setApiBaseUrl(tempApiUrl.trim());
                    showToast('API URL updated!', 'success');
                    setShowConfigModal(false);
                  }
                }}
              >
                <Text style={styles.modalBtnTextSave}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F8',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  topSection: {
    height: height * 0.40,
    paddingTop: 20,
    paddingHorizontal: 24,
    position: 'relative',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  titleContainer: {
    marginTop: 20,
    zIndex: 2,
    maxWidth: '65%',
  },
  welcomeText: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 28,
    color: Theme.colors.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
    lineHeight: 22,
  },
  headerImage: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    width: width * 0.65,
    height: height * 0.32,
    zIndex: 1,
  },
  formCard: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  errorAlert: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorAlertText: {
    color: '#EF4444',
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 13,
    color: Theme.colors.navy,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.white,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    height: '100%',
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 13,
    color: Theme.colors.teal,
  },
  loginBtn: {
    backgroundColor: Theme.colors.teal,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
  },
  signupLink: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.teal,
  },
  configBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Theme.colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  modalDescription: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
    lineHeight: 18,
    marginBottom: 20,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 12,
    color: Theme.colors.navy,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    backgroundColor: '#F9FAFB',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxWidth: '100%',
    flex: 0,
    width: '100%',
  },
  modalBtnCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalBtnSave: {
    backgroundColor: Theme.colors.teal,
  },
  modalBtnTextSecondary: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 13,
    color: '#4B5563',
  },
  modalBtnTextCancel: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: '#4B5563',
  },
  modalBtnTextSave: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.white,
  },
});
