import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, PlaneTakeoff, PlaneLanding, Calendar as CalendarIcon, Briefcase, Info, DollarSign } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';
import { apiClient } from '../services/apiClient';
import { useAuthStore } from '../store';

export default function CreateTripScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();

  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [availableWeight, setAvailableWeight] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fromCity || !toCity || !travelDate || !availableWeight || !pricePerKg) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/api/dashboard/trips', {
        userId,
        fromCity,
        toCity,
        travelDate,
        availableWeight: Number(availableWeight),
        pricePerKg: Number(pricePerKg),
      });

      if (res.data && res.data.success) {
        Alert.alert('Success', 'Trip posted successfully!');
        router.back();
      } else {
        Alert.alert('Error', res.data.message || 'Failed to create trip');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={Theme.colors.navy} />
          </Pressable>
          <Text style={styles.headerTitle}>Post a Trip</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.delay(100)} style={styles.formSection}>
            <Text style={styles.sectionTitle}>Travel Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Departure City</Text>
              <View style={styles.inputWrapper}>
                <PlaneTakeoff size={20} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. Mumbai, India" 
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={fromCity}
                  onChangeText={setFromCity}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Arrival City</Text>
              <View style={styles.inputWrapper}>
                <PlaneLanding size={20} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. London, UK" 
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={toCity}
                  onChangeText={setToCity}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Travel Date</Text>
              <Pressable style={styles.inputWrapper} onPress={() => setShowCalendar(!showCalendar)}>
                <CalendarIcon size={20} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <Text style={[styles.input, { color: travelDate ? Theme.colors.navy : Theme.colors['gray-400'] }]}>
                  {travelDate ? travelDate : 'Select Date'}
                </Text>
              </Pressable>
              
              {showCalendar && (
                <View style={styles.calendarContainer}>
                  <Calendar
                    onDayPress={(day: any) => {
                      setTravelDate(day.dateString);
                      setShowCalendar(false);
                    }}
                    markedDates={{
                      [travelDate]: { selected: true, selectedColor: Theme.colors.teal }
                    }}
                    minDate={new Date().toISOString().split('T')[0]}
                    theme={{
                      todayTextColor: Theme.colors.teal,
                      arrowColor: Theme.colors.teal,
                    }}
                  />
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.formSection}>
            <Text style={styles.sectionTitle}>Capacity & Pricing</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Available Weight</Text>
                <View style={styles.inputWrapper}>
                  <Briefcase size={20} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="e.g. 15 kg" 
                    keyboardType="numeric"
                    placeholderTextColor={Theme.colors['gray-400']}
                    value={availableWeight}
                    onChangeText={setAvailableWeight}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Price per kg</Text>
                <View style={styles.inputWrapper}>
                  <DollarSign size={20} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="e.g. 15" 
                    keyboardType="numeric"
                    placeholderTextColor={Theme.colors['gray-400']}
                    value={pricePerKg}
                    onChangeText={setPricePerKg}
                  />
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Info size={20} color={Theme.colors.teal} />
              <Text style={styles.infoText}>
                By posting a trip, you agree to carry legal, verified packages for FlyoraGo users and earn money.
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Pressable 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
              onPress={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Post Trip</Text>
              )}
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
    backgroundColor: Theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-100'],
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 15,
    color: Theme.colors.navy,
    lineHeight: 20, // To vertically center text
  },
  calendarContainer: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E6F4F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 13,
    color: Theme.colors.teal,
    marginLeft: 12,
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: Theme.colors.navy,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
  },
});
