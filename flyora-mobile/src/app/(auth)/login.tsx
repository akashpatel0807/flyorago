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
import { Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
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

// TravelBackgroundGraphics: Renders dotted travel curves behind the woman
const TravelBackgroundGraphics = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        {/* Main Curved flight path */}
        <Path
          d="M 20 180 Q 90 100 160 190 T 320 110"
          fill="none"
          stroke="rgba(14, 139, 109, 0.08)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />
        {/* Secondary route connection */}
        <Path
          d="M 120 220 Q 150 140 210 160"
          fill="none"
          stroke="rgba(14, 139, 109, 0.05)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </Svg>
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

  // Reanimated Shared Values for Micro Animations
  const glowScale1 = useSharedValue(1);
  const glowScale2 = useSharedValue(1);
  const planeX = useSharedValue(0);
  const planeY = useSharedValue(0);
  const planeRotation = useSharedValue(0);
  const pinY = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const heroScale = useSharedValue(1);
  const heroY = useSharedValue(0);

  useEffect(() => {
    // 1. Slow glowing background breathing animation (24s loop)
    glowScale1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 12000 }),
        withTiming(0.9, { duration: 12000 })
      ),
      -1,
      true
    );
    glowScale2.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 10000 }),
        withTiming(1.15, { duration: 10000 })
      ),
      -1,
      true
    );

    // 2. Slow airplane floating animation (20s loop)
    planeX.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 6000 }),
        withTiming(-12, { duration: 8000 }),
        withTiming(0, { duration: 6000 })
      ),
      -1,
      true
    );
    planeY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 7000 }),
        withTiming(8, { duration: 7000 }),
        withTiming(0, { duration: 6000 })
      ),
      -1,
      true
    );
    planeRotation.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 8000 }),
        withTiming(-4, { duration: 8000 }),
        withTiming(0, { duration: 6000 })
      ),
      -1,
      true
    );

    // 3. Location pin vertical bobbing (5s loop)
    pinY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2500 }),
        withTiming(5, { duration: 2500 })
      ),
      -1,
      true
    );

    // 4. Hero girl + suitcase floating scale animation (6s loop)
    heroScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 3000 }),
        withTiming(1.00, { duration: 3000 })
      ),
      -1,
      true
    );
    heroY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 3000 }),
        withTiming(3, { duration: 3000 })
      ),
      -1,
      true
    );
  }, []);

  // Animated Styles
  const animatedGlowStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale1.value }],
  }));

  const animatedGlowStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale2.value }],
  }));

  const animatedPlaneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: planeX.value },
      { translateY: planeY.value },
      { rotate: `${planeRotation.value}deg` },
    ],
  }));

  const animatedPinStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pinY.value }],
  }));

  const animatedHeroStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: heroScale.value },
      { translateY: heroY.value },
    ],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Login Button Press Feedbacks
  const onPressIn = () => {
    buttonScale.value = withTiming(0.96, { duration: 100 });
  };
  const onPressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
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
      <KeyboardAvoidingWrapper>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Top Illustration Section (approx. 38% height) */}
            <View style={styles.topSection}>
              {/* Glowing background circles for breathing gradient */}
              <Animated.View style={[styles.glowCircle1, animatedGlowStyle1]} />
              <Animated.View style={[styles.glowCircle2, animatedGlowStyle2]} />

              {/* Dotted Flight curves */}
              <TravelBackgroundGraphics />

              {/* Animated Floating Airplane */}
              <Animated.View style={[styles.floatingPlane, animatedPlaneStyle]}>
                <Ionicons name="airplane" size={14} color={EMERALD_GREEN} />
              </Animated.View>

              {/* Animated Floating Location Pin */}
              <Animated.View style={[styles.floatingPin, animatedPinStyle]}>
                <Ionicons name="location" size={16} color={EMERALD_GREEN} />
              </Animated.View>

              {/* Static background Location Pin */}
              <View style={styles.staticPin}>
                <Ionicons name="location" size={14} color="rgba(14, 139, 109, 0.4)" />
              </View>

              {/* Brand Header */}
              <View style={styles.brandHeader}>
                <Image
                  source={require('../../../assets/images/flyorago-icon.png')}
                  style={styles.brandIcon}
                  resizeMode="contain"
                />
                <Text style={styles.brandName}>Flyorago</Text>
              </View>

              {/* Welcome text layout */}
              <View style={styles.titleContainer}>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={[styles.welcomeText, { color: EMERALD_GREEN }]}>Back</Text>
                <Text style={styles.subtitle}>
                  Login to continue shipping{'\n'}smarter with Flyorago.
                </Text>
              </View>

              {/* Portrait Lady Image with scale/float breathing animation */}
              <Animated.View
                entering={FadeInDown.delay(150).duration(800)}
                style={[styles.imageWrapperContainer, animatedHeroStyle]}
              >
                <Image
                  source={require('../../../assets/images/girl2.png')}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>

            {/* Form Section */}
            <View style={styles.formCard}>
              {errorMsg ? (
                <Animated.View entering={FadeInDown} style={styles.errorAlert}>
                  <Text style={styles.errorAlertText}>{errorMsg}</Text>
                </Animated.View>
              ) : null}

              {/* Email Field */}
              <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                <StyledInput
                  placeholder="Email or Phone Number"
                  icon={User}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
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

              {/* Forgot Password */}
              <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
                <Pressable
                  style={styles.forgotBtn}
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>
              </Animated.View>

              {/* Login Button with Reanimated Press scaling & Gradient */}
              <Animated.View entering={FadeInDown.delay(350).duration(600).springify()}>
                <Pressable
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <AnimatedLinearGradient
                    colors={[EMERALD_GREEN, '#0B7A5F']}
                    style={[
                      styles.loginBtn,
                      animatedButtonStyle,
                      loading && { opacity: 0.7 },
                    ]}
                  >
                    <View style={{ width: 28 }} />
                    <Text style={styles.loginBtnText}>
                      {loading ? 'Logging in...' : 'Login'}
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
                  <Text style={styles.dividerText}>Or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  {/* Google Button */}
                  <Pressable style={styles.socialBtn}>
                    <AntDesign name="google" size={24} color="#EA4335" />
                  </Pressable>

                  {/* Apple Button */}
                  <Pressable style={styles.socialBtn}>
                    <Ionicons name="logo-apple" size={24} color="#000000" />
                  </Pressable>

                  {/* Facebook Button */}
                  <Pressable style={styles.socialBtn}>
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </Pressable>
                </View>
              </Animated.View>

              {/* Signup Link */}
              <Animated.View entering={FadeInDown.delay(450).duration(600).springify()}>
                <View style={styles.signupRow}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <Pressable onPress={() => router.push('/(auth)/signup')}>
                    <Text style={[styles.signupLink, { color: EMERALD_GREEN }]}>Sign Up</Text>
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
    height: height * 0.38,
    paddingTop: 16,
    paddingHorizontal: 24,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    backgroundColor: '#FFFFFF', // Base white
    overflow: 'hidden',
  },
  glowCircle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: 'rgba(232, 248, 244, 0.65)', // Mint glow
    zIndex: 0,
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    backgroundColor: 'rgba(14, 139, 109, 0.045)', // Emerald glow
    zIndex: 0,
  },
  floatingPlane: {
    position: 'absolute',
    top: 75,
    right: width * 0.44,
    opacity: 0.08,
    zIndex: 1,
  },
  floatingPin: {
    position: 'absolute',
    top: 140,
    left: width * 0.46,
    opacity: 0.08,
    zIndex: 1,
  },
  staticPin: {
    position: 'absolute',
    bottom: 60,
    left: 28,
    opacity: 0.06,
    zIndex: 1,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    top: 16,
    left: 24,
    zIndex: 10,
  },
  brandIcon: {
    width: 24,
    height: 24,
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
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 10,
  },
  imageWrapperContainer: {
    position: 'absolute',
    right: 0,
    bottom: -15,
    width: width * 0.48,
    height: height * 0.32,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 32,
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
    color: '#111827',
    height: '100%',
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 13,
    color: EMERALD_GREEN,
    fontWeight: 'bold',
  },
  loginBtn: {
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
  loginBtnText: {
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
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: '#6B7280',
  },
  signupLink: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
