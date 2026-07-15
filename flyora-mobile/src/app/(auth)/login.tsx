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
import { Lock, Eye, EyeOff } from 'lucide-react-native';
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

export default function LoginScreen() {
  const router = useRouter();
  const loginUserStore = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      <KeyboardAvoidingWrapper>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Original Header Section with Girl Illustration */}
            <View style={styles.topSection}>
              <Animated.View
                entering={FadeInDown.delay(100).duration(600).springify()}
                style={styles.titleContainer}
              >
                <Text style={styles.welcomeText}>
                  Welcome <Text style={{ color: Theme.colors.teal }}>Back</Text>
                </Text>
                <Text style={styles.subtitle}>
                  Login to continue shipping{'\n'}smarter with Flyorago.
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

              {/* Email Field */}
              <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                <FloatingLabelInput
                  label="Email or Phone Number"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Animated.View>

              {/* Password Field */}
              <Animated.View entering={FadeInDown.delay(250).duration(600).springify()}>
                <FloatingLabelInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Animated.View>

              {/* Forgot Password */}
              <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
                <Pressable
                  style={styles.forgotBtn}
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>
              </Animated.View>

              {/* Login Button */}
              <Animated.View entering={FadeInDown.delay(350).duration(600).springify()}>
                <Pressable
                  style={({ pressed }) => [
                    styles.loginBtn,
                    pressed && { opacity: 0.9, scale: 0.98 },
                    loading && { opacity: 0.7 },
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.loginBtnText}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Text>
                </Pressable>
              </Animated.View>

              {/* Signup Link */}
              <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                <View style={styles.signupRow}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <Pressable onPress={() => router.push('/(auth)/signup')}>
                    <Text style={styles.signupLink}>Sign Up</Text>
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
    paddingTop: 24,
    paddingHorizontal: 28,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    zIndex: 2,
    maxWidth: '62%',
    marginBottom: 8,
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
    width: width * 0.55,
    height: height * 0.26,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 26,
  },
  forgotText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 13,
    color: Theme.colors.teal,
    fontWeight: '600',
  },
  loginBtn: {
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
  loginBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
});
