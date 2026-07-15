import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, Moon, Bell, Shield, Globe, LogOut } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '../store';

export default function SettingsPreferencesScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconBox}>
                  <Moon size={20} color={Theme.colors.navy} />
                </View>
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={setIsDarkMode}
                trackColor={{ false: Theme.colors['gray-200'], true: Theme.colors.teal }}
                thumbColor={Theme.colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconBox}>
                  <Bell size={20} color={Theme.colors.navy} />
                </View>
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch 
                value={pushNotifications} 
                onValueChange={setPushNotifications}
                trackColor={{ false: Theme.colors['gray-200'], true: Theme.colors.teal }}
                thumbColor={Theme.colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconBox}>
                  <Globe size={20} color={Theme.colors.navy} />
                </View>
                <Text style={styles.settingText}>Location Services</Text>
              </View>
              <Switch 
                value={locationServices} 
                onValueChange={setLocationServices}
                trackColor={{ false: Theme.colors['gray-200'], true: Theme.colors.teal }}
                thumbColor={Theme.colors.white}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.settingCard}>
            <Pressable style={styles.settingItem} onPress={() => router.push('/kyc')}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#E6F4F1' }]}>
                  <Shield size={20} color={Theme.colors.teal} />
                </View>
                <View>
                  <Text style={styles.settingText}>KYC Verification</Text>
                  <Text style={styles.settingDesc}>Verify your identity</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#F56565" />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
          <Text style={styles.versionText}>FlyoraGo App v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-100'],
    backgroundColor: Theme.colors.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors['off-white'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
    marginBottom: 16,
    marginTop: 8,
  },
  settingCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors['off-white'],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
  },
  settingDesc: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors['gray-100'],
    marginLeft: 56,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: '#F56565',
    marginLeft: 10,
  },
  versionText: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-400'],
    textAlign: 'center',
    marginTop: 24,
  },
});
