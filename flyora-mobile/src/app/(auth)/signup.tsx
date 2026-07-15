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
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const EMERALD_GREEN = '#0E8B6D';

interface StyledInputProps {
  placeholder: string;
  icon: React.ComponentType<any>;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

// Mockup-matching rounded white card TextInput with soft shadow and stable focus
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
          color={isFocused ? EMERALD_GREEN : '#94A3B8'}
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

  // Reanimated Button Press Scale Animation
  const scale = useSharedValue(1);
  const onPressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };
  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

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

              {/* Welcome text layout */}
              <View style={styles.titleContainer}>
                <Text style={styles.welcomeText}>Create</Text>
                <Text style={[styles.welcomeText, { color: EMERALD_GREEN }]}>Account</Text>
                <Text style={styles.subtitle}>
                  Join Flyorago and start shipping{'\n'}smarter today.
                </Text>
              </View>

              {/* Globe and Boxes Illustration */}
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
              <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
                <StyledInput
                  placeholder="Full Name"
                  icon={User}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </Animated.View>

              {/* Email Address Field */}
              <Animated.View entering={FadeInDown.delay(150).duration(600).springify()}>
                <StyledInput
                  placeholder="Email Address"
                  icon={Mail}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Animated.View>

              {/* Custom Phone Number Field (mockup flag dropdown & code) */}
              <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.inputGroup}>
                <View
                  style={[
                    styles.phoneInputWrapper,
                    isPhoneFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <Phone size={18} color={isPhoneFocused ? EMERALD_GREEN : '#94A3B8'} style={styles.inputIcon} />
                  
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
              </Animated.View>

              {/* Password Field */}
              <Animated.View entering={FadeInDown.delay(250).duration(600).springify()}>
                <StyledInput
                  placeholder="Password"
                  icon={Lock}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Animated.View>

              {/* Confirm Password Field */}
              <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
                <StyledInput
                  placeholder="Confirm Password"
                  icon={Lock}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </Animated.View>

              {/* Circular Radio Checkbox for Terms */}
              <Animated.View entering={FadeInDown.delay(320).duration(600).springify()}>
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
              </Animated.View>

              {/* Create Account Button with Reanimated Press scaling & Gradient */}
              <Animated.View entering={FadeInDown.delay(350).duration(600).springify()}>
                <Pressable
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  <AnimatedLinearGradient
                    colors={[EMERALD_GREEN, '#0B7A5F']}
                    style={[
                      styles.signupBtn,
                      animatedButtonStyle,
                      loading && { opacity: 0.7 },
                    ]}
                  >
                    <View style={{ width: 24 }} />
                    <Text style={styles.signupBtnText}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                    <View style={styles.buttonArrowCircle}>
                      <ArrowRight size={14} color={EMERALD_GREEN} />
                    </View>
                  </AnimatedLinearGradient>
                </Pressable>
              </Animated.View>

              {/* Social Login Placeholders */}
              <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Or sign up with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  {/* Google Button */}
                  <Pressable style={styles.socialBtn}>
                    <AntDesign name="google" size={24} color="#EA4335" />
                  </Pressable>

                  {/* Apple Button */}
                  <Pressable style={styles.socialBtn}>
                    <AntDesign name="apple1" size={24} color="#000000" />
                  </Pressable>

                  {/* Facebook Button */}
                  <Pressable style={styles.socialBtn}>
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </Pressable>
                </View>
              </Animated.View>

              {/* Login Link */}
              <Animated.View entering={FadeInDown.delay(450).duration(600).springify()}>
                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Pressable onPress={() => router.replace('/(auth)/login')}>
                    <Text style={[styles.loginLink, { color: EMERALD_GREEN }]}>Login</Text>
                  </Pressable>
                </View>
              </Animated.View>
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
    borderWidth: 1,
    borderColor: '#F1F5F9', // Very soft border
    borderRadius: 18,
    height: 58,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    // Soft elevation shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: EMERALD_GREEN,
    shadowOpacity: 0.08,
    shadowRadius: 12,
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
    borderWidth: 1,
    borderColor: '#F1F5F9', // Very soft border
    borderRadius: 18,
    height: 58,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    // Soft elevation shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
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
    borderColor: EMERALD_GREEN,
  },
  circleCheckboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: EMERALD_GREEN,
  },
  termsText: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
    lineHeight: 18,
  },
  termsLink: {
    color: EMERALD_GREEN,
    fontWeight: 'bold',
  },
  signupBtn: {
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: EMERALD_GREEN,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: '#94A3B8',
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  socialBtn: {
    width: 80,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
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
    fontWeight: 'bold',
  },
});
