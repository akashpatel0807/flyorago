import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, useToastStore } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { Shield, Lock, ArrowLeft, User } from 'lucide-react-native';

export default function AdminLoginScreen() {
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const router = useRouter();
  const adminLoginStore = useAuthStore((state) => state.adminLogin);
  const showToast = useToastStore((state) => state.showToast);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async () => {
    if (!username || !password) {
      setErrorMsg('Please enter username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiClient.post('/api/admin/login', {
        username: username.trim(),
        password,
      });

      const resData = response.data;
      if (resData.success && resData.data) {
        await adminLoginStore(resData.data.token, resData.data.username);
        showToast('Admin access authorized.', 'success');
        router.replace('/admin/dashboard');
      } else {
        setErrorMsg(resData.message || 'Access denied.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Verification failed. Admin portal unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/')} style={styles.backBtn}>
            <ArrowLeft size={22} color={activeColors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: activeColors.navy }]}>Admin Gateway</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <View style={[styles.logoIcon, { backgroundColor: activeColors.navy }]}>
              <Shield size={24} color="#fff" />
            </View>
            <Text style={[styles.logoTitle, { color: activeColors.navy }]}>Staff Authorization</Text>
            <Text style={[styles.logoSubtitle, { color: activeColors.textSecondary }]}>
              Unauthorized access to this portal is strictly monitored. Please verify credentials.
            </Text>
          </View>

          <View style={styles.form}>
            {errorMsg ? (
              <View style={[styles.errorAlert, { backgroundColor: activeColors.error + '1A', borderColor: activeColors.error }]}>
                <Text style={[styles.errorAlertText, { color: activeColors.error }]}>{errorMsg}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Username"
              placeholder="Enter administrator username"
              value={username}
              onChangeText={setUsername}
              iconLeft={<User size={18} color={activeColors.textSecondary} />}
            />

            <CustomInput
              label="Secret Key / Password"
              placeholder="Enter secret credentials"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              iconLeft={<Lock size={18} color={activeColors.textSecondary} />}
            />

            <CustomButton
              title="Verify & Enter"
              onPress={handleAdminLogin}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.verifyBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  placeholder: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: Spacing.five,
    marginBottom: Spacing.five,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.large,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  logoSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  errorAlert: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifyBtn: {
    marginTop: Spacing.four,
  },
});
