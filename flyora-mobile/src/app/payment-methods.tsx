import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, CreditCard, Plus, Smartphone, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PaymentMethodsScreen() {
  const router = useRouter();

  const cards = [
    { id: 1, type: 'Visa', number: '•••• •••• •••• 4242', expiry: '12/26', isDefault: true },
    { id: 2, type: 'MasterCard', number: '•••• •••• •••• 5555', expiry: '08/25', isDefault: false },
  ];

  const upi = [
    { id: 1, id_str: 'aakashpatel@okicici', app: 'Google Pay' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Theme.colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Cards</Text>
          
          {cards.map((card, index) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardLeft}>
                <View style={styles.cardIconBox}>
                  <CreditCard size={20} color={Theme.colors.navy} />
                </View>
                <View>
                  <Text style={styles.cardNumber}>{card.type} ending in {card.number.slice(-4)}</Text>
                  <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
                </View>
              </View>
              {card.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              ) : (
                <Pressable>
                  <Trash2 size={20} color={Theme.colors['gray-400']} />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable style={styles.addBtn}>
            <Plus size={20} color={Theme.colors.teal} />
            <Text style={styles.addBtnText}>Add New Card</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>UPI IDs</Text>
          
          {upi.map((item, index) => (
            <View key={item.id} style={styles.cardItem}>
              <View style={styles.cardLeft}>
                <View style={styles.cardIconBox}>
                  <Smartphone size={20} color={Theme.colors.navy} />
                </View>
                <View>
                  <Text style={styles.cardNumber}>{item.id_str}</Text>
                  <Text style={styles.cardExpiry}>{item.app}</Text>
                </View>
              </View>
              <Pressable>
                <Trash2 size={20} color={Theme.colors['gray-400']} />
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.addBtn}>
            <Plus size={20} color={Theme.colors.teal} />
            <Text style={styles.addBtnText}>Add New UPI ID</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 16,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors['gray-100'],
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Theme.colors['off-white'],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardNumber: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    marginBottom: 2,
  },
  cardExpiry: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
  },
  defaultBadge: {
    backgroundColor: 'rgba(52, 168, 140, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: Theme.colors.teal,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Theme.colors.teal,
    marginTop: 4,
  },
  addBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.teal,
    marginLeft: 8,
  },
});
