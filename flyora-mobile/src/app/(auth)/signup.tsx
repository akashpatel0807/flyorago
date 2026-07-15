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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useToastStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import { ArrowLeft, User, Lock, Eye, EyeOff, Mail, Phone, CheckSquare, Square } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<
    'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword' | null
  >(null);

  const handleSignup = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms & Conditions.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiClient.post('/api/auth/signup', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: 'user',
      });

      const resData = response.data;
      if (resData.success) {
        showToast('Registration successful! Please log in.', 'success');
        router.replace('/(auth)/login');
      } else {
        setErrorMsg(resData.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Section */}
          <View style={styles.topSection}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color={Theme.colors.navy} />
              </Pressable>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>
                Create <Text style={{ color: Theme.colors.teal }}>Account</Text>
              </Text>
              <Text style={styles.subtitle}>
                Join Flyorago and start your{'\n'}smart shipping journey.
              </Text>
            </View>

            <Image
              source={require('../../../assets/images/girl1.png')}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {errorMsg ? (
              <Animated.View entering={FadeInDown} style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>{errorMsg}</Text>
              </Animated.View>
            ) : null}

            {/* Full Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'fullName' && styles.inputWrapperFocused,
                ]}
              >
                <User
                  size={18}
                  color={focusedField === 'fullName' ? Theme.colors.teal : Theme.colors['gray-400']}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'email' && styles.inputWrapperFocused,
                ]}
              >
                <Mail
                  size={18}
                  color={focusedField === 'email' ? Theme.colors.teal : Theme.colors['gray-400']}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Phone Number Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'phone' && styles.inputWrapperFocused,
                ]}
              >
                <Phone
                  size={18}
                  color={focusedField === 'phone' ? Theme.colors.teal : Theme.colors['gray-400']}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <Lock
                  size={18}
                  color={focusedField === 'password' ? Theme.colors.teal : Theme.colors['gray-400']}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <Eye size={18} color={Theme.colors['gray-400']} />
                  ) : (
                    <EyeOff size={18} color={Theme.colors['gray-400']} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                ]}
              >
                <Lock
                  size={18}
                  color={focusedField === 'confirmPassword' ? Theme.colors.teal : Theme.colors['gray-400']}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                >
                  {showConfirmPassword ? (
                    <Eye size={18} color={Theme.colors['gray-400']} />
                  ) : (
                    <EyeOff size={18} color={Theme.colors['gray-400']} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Terms and Conditions Checkbox */}
            <Pressable
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              {agreeTerms ? (
                <CheckSquare size={20} color={Theme.colors.teal} />
              ) : (
                <Square size={20} color={Theme.colors['gray-400']} />
              )}
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Pressable>

            {/* Signup Button */}
            <Pressable
              style={({ pressed }) => [
                styles.signupBtn,
                pressed && { opacity: 0.9, scale: 0.98 },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupBtnText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </Pressable>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  topSection: {
    height: height * 0.30,
    paddingTop: 16,
    paddingHorizontal: 24,
    position: 'relative',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  titleContainer: {
    marginTop: 10,
    zIndex: 2,
    maxWidth: '65%',
  },
  welcomeText: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.navy,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
    lineHeight: 20,
  },
  headerImage: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    width: width * 0.52,
    height: height * 0.25,
    zIndex: 1,
  },
  formCard: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 10,
  },
  errorAlert: {
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorAlertText: {
    color: '#EF4444',
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  inputWrapperFocused: {
    borderColor: Theme.colors.teal,
    backgroundColor: Theme.colors.white,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    paddingHorizontal: 4,
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
    lineHeight: 18,
  },
  termsLink: {
    color: Theme.colors.teal,
    fontWeight: '600',
  },
  signupBtn: {
    backgroundColor: Theme.colors.teal,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  signupBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: '#94A3B8',
    paddingHorizontal: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  socialBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-500'],
  },
  loginLink: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.teal,
    fontWeight: 'bold',
  },
});
