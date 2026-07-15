import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, MapPin, Home, Briefcase, Plus, MoreVertical } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CustomButton } from '../components/CustomButton';

export default function AddressesScreen() {
  const router = useRouter();

  const addresses = [
    { id: 1, type: 'Home', address: '123, Navrangpura, Near University, Ahmedabad, Gujarat 380009', icon: Home, isDefault: true },
    { id: 2, type: 'Office', address: '45/A, SG Highway, Satellite, Ahmedabad, Gujarat 380015', icon: Briefcase, isDefault: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)}>
          {addresses.map((item, index) => (
            <View key={item.id} style={styles.addressCard}>
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <item.icon size={16} color={Theme.colors.teal} />
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                {!item.isDefault && (
                  <Pressable>
                    <MoreVertical size={20} color={Theme.colors['gray-400']} />
                  </Pressable>
                )}
              </View>
              
              <View style={styles.addressBody}>
                <MapPin size={20} color={Theme.colors['gray-400']} style={{ marginTop: 2 }} />
                <Text style={styles.addressText}>{item.address}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Pressable style={styles.addAddressBtn}>
            <Plus size={20} color={Theme.colors.teal} />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </Pressable>
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
  addressCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 168, 140, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 13,
    color: Theme.colors.teal,
    marginLeft: 6,
  },
  defaultBadge: {
    backgroundColor: Theme.colors['gray-100'],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: Theme.colors['gray-600'],
  },
  addressBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors['gray-600'],
    lineHeight: 22,
    marginLeft: 12,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Theme.colors.teal,
    borderRadius: 20,
    paddingVertical: 18,
    marginTop: 8,
  },
  addAddressText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 15,
    color: Theme.colors.teal,
    marginLeft: 8,
  },
});
