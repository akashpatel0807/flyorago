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
import { apiClient } from '../../services/apiClient';
import { Theme } from '../../constants/theme';
import { ArrowLeft, Mail } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useToastStore } from '../../store';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiClient.post('/api/auth/forgot-password', {
        email: email.trim(),
      });

      const resData = response.data;
      if (resData.success) {
        showToast(resData.message || 'Password reset link sent to your email!', 'success');
        router.back();
      } else {
        setErrorMsg(resData.message || 'Something went wrong.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Something went wrong.');
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
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={Theme.colors.navy} />
            </Pressable>

            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>
                Forgot <Text style={{ color: Theme.colors.teal }}>Password?</Text>
              </Text>
              <Text style={styles.subtitle}>
                Enter your email address to{'\n'}receive a password reset link.
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
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Pressable 
              style={[styles.resetBtn, loading && { opacity: 0.7 }]} 
              onPress={handleReset}
              disabled={loading}
            >
              <Text style={styles.resetBtnText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
            </Pressable>
            
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 30,
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
  resetBtn: {
    backgroundColor: Theme.colors.teal,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
  },
});
