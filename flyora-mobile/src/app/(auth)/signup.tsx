import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Eye, EyeOff, CheckSquare, Square } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

// Google/Microsoft-style sleek Floating Label Input with professional border radius
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: FloatingLabelInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  const animatedValue = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    animatedValue.value = withTiming((isFocused || value) ? 1 : 0, { duration: 150 });
  }, [isFocused, value]);

  const labelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animatedValue.value, [0, 1], [18, -8]);
    const scale = interpolate(animatedValue.value, [0, 1], [1, 0.82]);
    const left = interpolate(animatedValue.value, [0, 1], [16, 12]);

    return {
      transform: [
        { translateY },
        { scale },
      ],
      left,
    };
  });

  return (
    <View style={styles.floatingInputGroup}>
      <Animated.Text
        style={[
          styles.floatingLabel,
          labelStyle,
          {
            color: isFocused ? Theme.colors.teal : '#64748B',
            backgroundColor: isFocused || value ? '#FFFFFF' : 'transparent',
            paddingHorizontal: isFocused || value ? 4 : 0,
          },
        ]}
      >
        {label}
      </Animated.Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <TextInput
          style={styles.input}
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
              <Eye size={18} color="#64748B" />
            ) : (
              <EyeOff size={18} color="#64748B" />
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
      <KeyboardAvoidingWrapper>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Header Section with original Back Button and illustration layout */}
            <View style={styles.topSection}>
              <View style={styles.headerRow}>
                <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.backBtn}>
                  <ArrowLeft size={24} color={Theme.colors.navy} />
                </Pressable>
              </View>

              <Animated.View
                entering={FadeInDown.delay(100).duration(600).springify()}
                style={styles.titleContainer}
              >
                <Text style={styles.welcomeText}>
                  Create <Text style={{ color: Theme.colors.teal }}>Account</Text>
                </Text>
                <Text style={styles.subtitle}>
                  Join Flyorago and start your{'\n'}smart shipping journey.
                </Text>
              </Animated.View>

              <Animated.Image
                entering={FadeInDown.delay(150).duration(700).springify()}
                source={require('../../../assets/images/girl1.png')}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </View>

            {/* Google/Microsoft-style sleek Form Container */}
            <View style={styles.formCard}>
              {errorMsg ? (
                <Animated.View entering={FadeInDown} style={styles.errorAlert}>
                  <Text style={styles.errorAlertText}>{errorMsg}</Text>
                </Animated.View>
              ) : null}

              {/* Full Name Field */}
              <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                <FloatingLabelInput
                  key="signup-fullname"
                  label="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </Animated.View>

              {/* Email Field */}
              <Animated.View entering={FadeInDown.delay(250).duration(600).springify()}>
                <FloatingLabelInput
                  key="signup-email"
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Animated.View>

              {/* Phone Number Field */}
              <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
                <FloatingLabelInput
                  key="signup-phone"
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </Animated.View>

              {/* Password Field */}
              <Animated.View entering={FadeInDown.delay(350).duration(600).springify()}>
                <FloatingLabelInput
                  key="signup-password"
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Animated.View>

              {/* Confirm Password Field */}
              <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                <FloatingLabelInput
                  key="signup-confirmpassword"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </Animated.View>

              {/* Terms and Conditions Checkbox */}
              <Animated.View entering={FadeInDown.delay(450).duration(600).springify()}>
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
              </Animated.View>

              {/* Signup Button */}
              <Animated.View entering={FadeInDown.delay(500).duration(600).springify()}>
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
              </Animated.View>

              {/* Login Link */}
              <Animated.View entering={FadeInDown.delay(550).duration(600).springify()}>
                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Pressable onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.loginLink}>Login</Text>
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
    height: height * 0.30,
    paddingTop: 16,
    paddingHorizontal: 24,
    position: 'relative',
    justifyContent: 'space-between',
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
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
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
  },
  errorAlert: {
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
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
  floatingInputGroup: {
    position: 'relative',
    marginBottom: 20,
    width: '100%',
  },
  floatingLabel: {
    position: 'absolute',
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    zIndex: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1', // Clean grey border like Google
    borderRadius: 12, // Professional sleek radius
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  inputWrapperFocused: {
    borderColor: Theme.colors.teal, // Accent border on focus
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 0 : 4,
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
    borderRadius: 12, // Sleek button border radius
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  signupBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.white,
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
