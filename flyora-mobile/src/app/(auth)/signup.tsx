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
import { useToastStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import { ArrowLeft, Lock, Eye, EyeOff, Mail, Phone, User, ChevronDown, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface StyledInputProps {
  placeholder: string;
  icon: React.ComponentType<any>;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

// Flat grey TextInput with stable local focus styling matching the mockup
const StyledInput = ({
  placeholder,
  icon: Icon,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: StyledInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={styles.inputGroup}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <Icon
          size={18}
          color={isFocused ? Theme.colors.teal : '#94A3B8'}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !showPassword : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            {showPassword ? (
              <Eye size={18} color="#94A3B8" />
            ) : (
              <EyeOff size={18} color="#94A3B8" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

// KeyboardAvoidingWrapper: Only wraps KeyboardAvoidingView on iOS to prevent Android soft-keyboard conflicts
const KeyboardAvoidingWrapper = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        {children}
      </KeyboardAvoidingView>
    );
  }
  return <View style={{ flex: 1 }}>{children}</View>;
};

export default function SignupScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

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
      setErrorMsg('You must agree to the Terms of Service & Privacy Policy.');
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
      <KeyboardAvoidingWrapper>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Top Illustration Section */}
            <View style={styles.topSection}>
              {/* Brand Header with Back Button */}
              <View style={styles.brandHeader}>
                <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.backArrowCircle}>
                  <ArrowLeft size={18} color={Theme.colors.navy} />
                </Pressable>
                <Image
                  source={require('../../../assets/images/flyorago-icon.png')}
                  style={styles.brandIcon}
                  resizeMode="contain"
                />
                <Text style={styles.brandName}>Flyorago</Text>
              </View>

              {/* Centered Welcome text layout */}
              <View style={styles.titleContainer}>
                <Text style={styles.welcomeText}>Create</Text>
                <Text style={[styles.welcomeText, { color: Theme.colors.teal }]}>Account</Text>
                <Text style={styles.subtitle}>
                  Join Flyorago and start shipping{'\n'}smarter today.
                </Text>
              </View>

              {/* Globe and Boxes Illustration for HD cover sizing */}
              <Image
                source={require('../../../assets/images/onbording second screen.png')}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </View>

            {/* Form Section */}
            <View style={styles.formCard}>
              {errorMsg ? (
                <Animated.View entering={FadeInDown} style={styles.errorAlert}>
                  <Text style={styles.errorAlertText}>{errorMsg}</Text>
                </Animated.View>
              ) : null}

              {/* Full Name Field */}
              <StyledInput
                placeholder="Full Name"
                icon={User}
                value={fullName}
                onChangeText={setFullName}
              />

              {/* Email Address Field */}
              <StyledInput
                placeholder="Email Address"
                icon={Mail}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Custom Phone Number Field (mockup flag dropdown & code) */}
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.phoneInputWrapper,
                    isPhoneFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <Phone size={18} color={isPhoneFocused ? Theme.colors.teal : '#94A3B8'} style={styles.inputIcon} />
                  
                  {/* Flag Selector */}
                  <View style={styles.flagDropdown}>
                    <Text style={styles.flagText}>🇮🇳</Text>
                    <ChevronDown size={10} color="#94A3B8" />
                  </View>

                  {/* Country Code */}
                  <View style={styles.countryCodeDropdown}>
                    <Text style={styles.countryCodeText}>+91</Text>
                    <ChevronDown size={10} color="#94A3B8" />
                  </View>

                  {/* Vertical Divider */}
                  <View style={styles.verticalDivider} />

                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Phone Number"
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                  />
                </View>
              </View>

              {/* Password Field */}
              <StyledInput
                placeholder="Password"
                icon={Lock}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* Confirm Password Field */}
              <StyledInput
                placeholder="Confirm Password"
                icon={Lock}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              {/* Circular Radio Checkbox for Terms */}
              <Pressable
                style={styles.termsRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                <View
                  style={[
                    styles.circleCheckbox,
                    agreeTerms && styles.circleCheckboxChecked,
                  ]}
                >
                  {agreeTerms && <View style={styles.circleCheckboxInner} />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </Pressable>

              {/* Create Account Button with Chevron circle */}
              <Pressable
                style={({ pressed }) => [
                  styles.signupBtn,
                  pressed && { opacity: 0.9, scale: 0.98 },
                  loading && { opacity: 0.7 },
                ]}
                onPress={handleSignup}
                disabled={loading}
              >
                <View style={{ width: 24 }} />
                <Text style={styles.signupBtnText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
                <View style={styles.buttonArrowCircle}>
                  <ArrowRight size={14} color={Theme.colors.teal} />
                </View>
              </Pressable>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Pressable onPress={() => router.replace('/(auth)/login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
  },
  topSection: {
    height: height * 0.35,
    paddingTop: 16,
    paddingHorizontal: 24,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    backgroundColor: '#F0FDF8', // Soft green background
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: 24,
    zIndex: 10,
  },
  backArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  brandName: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.navy,
  },
  titleContainer: {
    zIndex: 2,
    maxWidth: '55%',
  },
  welcomeText: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 34,
    fontWeight: 'bold',
    color: Theme.colors.navy,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
    lineHeight: 18,
    marginTop: 10,
  },
  headerImage: {
    position: 'absolute',
    right: 0,
    bottom: -15,
    width: width * 0.48,
    height: height * 0.32,
    zIndex: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 8,
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
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  inputWrapperFocused: {
    borderColor: Theme.colors.teal,
    backgroundColor: '#FFFFFF',
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
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  flagDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
  },
  flagText: {
    fontSize: 18,
  },
  countryCodeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
  },
  countryCodeText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  phoneInput: {
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
    marginBottom: 24,
    paddingHorizontal: 4,
    gap: 12,
  },
  circleCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  circleCheckboxChecked: {
    borderColor: Theme.colors.teal,
  },
  circleCheckboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.teal,
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
    fontWeight: 'bold',
  },
  signupBtn: {
    backgroundColor: Theme.colors.teal,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  buttonArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
