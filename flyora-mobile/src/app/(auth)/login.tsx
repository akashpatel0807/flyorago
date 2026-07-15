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
import { Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react-native';
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

// Mockup-matching flat TextInput with stable local focus styling
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
            {/* Top Illustration Section */}
            <View style={styles.topSection}>
              {/* Brand Header */}
              <View style={styles.brandHeader}>
                <Image
                  source={require('../../../assets/images/flyorago-icon.png')}
                  style={styles.brandIcon}
                  resizeMode="contain"
                />
                <Text style={styles.brandName}>Flyorago</Text>
              </View>

              {/* Centered Welcome text layout */}
              <View style={styles.titleContainer}>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={[styles.welcomeText, { color: Theme.colors.teal }]}>Back</Text>
                <Text style={styles.subtitle}>
                  Login to continue shipping{'\n'}smarter with Flyorago.
                </Text>
              </View>

              <Image
                source={require('../../../assets/images/girl1.png')}
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

              {/* Email Field */}
              <StyledInput
                placeholder="Email or Phone Number"
                icon={User}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password Field */}
              <StyledInput
                placeholder="Password"
                icon={Lock}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* Forgot Password */}
              <Pressable
                style={styles.forgotBtn}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              {/* Login Button with Chevron Arrow circle */}
              <Pressable
                style={({ pressed }) => [
                  styles.loginBtn,
                  pressed && { opacity: 0.9, scale: 0.98 },
                  loading && { opacity: 0.7 },
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <View style={{ width: 24 }} />
                <Text style={styles.loginBtnText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
                <View style={styles.buttonArrowCircle}>
                  <ArrowRight size={14} color={Theme.colors.teal} />
                </View>
              </Pressable>

              {/* Signup Link */}
              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <Pressable onPress={() => router.push('/(auth)/signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
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
    height: height * 0.32,
    paddingTop: 16,
    paddingHorizontal: 24,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 36,
    backgroundColor: '#F0FDF8', // Soft green background
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
    color: Theme.colors['gray-500'],
    lineHeight: 18,
    marginTop: 10,
  },
  headerImage: {
    position: 'absolute',
    right: 0,
    bottom: -15,
    width: width * 0.50,
    height: height * 0.28,
    zIndex: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
    marginTop: -24,
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
    color: Theme.colors.teal,
    fontWeight: 'bold',
  },
  loginBtn: {
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
