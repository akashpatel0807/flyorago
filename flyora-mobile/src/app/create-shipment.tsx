import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { ArrowLeft, MapPin, Package, Calendar as CalendarIcon, Camera, X } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../store';
import { apiClient } from '../services/apiClient';

export default function CreateShipmentScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(''); // e.g. 2026-12-12
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 images.');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.25,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => 
        asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri
      );
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateShipment = async () => {
    if (!fromCity || !toCity || !deliveryDate || !weight || !category || !description) {
      Alert.alert('Missing Fields', 'Please fill in all the required fields.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Image Required', 'Please upload at least 1 package image.');
      return;
    }

    const currentUserId = userId || 'mock-user-id-123';

    setLoading(true);

    try {
      const pricePaid = Math.max(500, Number(weight) * 120); // Calculate a dummy price
      const title = `Shipment to ${toCity}`;

      const payload = {
        userId: currentUserId,
        title,
        fromCity,
        toCity,
        deliveryDeadline: deliveryDate,
        weight: Number(weight),
        pricePaid,
        category: category.toLowerCase(),
        description,
        images, // Array of up to 5 image URIs
      };

      const res = await apiClient.post('/api/dashboard/shipments', payload);
      if (res.data.success) {
         Alert.alert('Success', 'Shipment request created successfully!', [
           { text: 'OK', onPress: () => router.push('/(tabs)/shipments') }
         ]);
      } else {
         Alert.alert('Error', res.data.message || 'Failed to create shipment');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Internal error creating shipment');
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
          <Text style={styles.headerTitle}>Post a Shipment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.formSection}>
            <Text style={styles.sectionTitle}>Route Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pickup Location</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ahmedabad"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={fromCity}
                  onChangeText={setFromCity}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drop-off Location</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mumbai"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={toCity}
                  onChangeText={setToCity}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery By Date *</Text>
              <Pressable style={styles.inputWrapper} onPress={() => setShowCalendar(true)}>
                <CalendarIcon size={20} color={Theme.colors['gray-400']} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Select Date" 
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={deliveryDate}
                  editable={false}
                  pointerEvents="none"
                />
              </Pressable>
              
              {showCalendar && (
                <DateTimePicker
                  value={deliveryDate ? new Date(deliveryDate) : new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event: any, selectedDate?: Date) => {
                    if (Platform.OS === 'android') {
                      setShowCalendar(false);
                    }
                    if (selectedDate) {
                      setDeliveryDate(selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
              {Platform.OS === 'ios' && showCalendar && (
                <Pressable style={styles.closeCalendarBtn} onPress={() => setShowCalendar(false)}>
                  <Text style={styles.closeCalendarText}>Done</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.formSection}>
            <Text style={styles.sectionTitle}>Package Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5"
                  keyboardType="numeric"
                  placeholderTextColor={Theme.colors['gray-400']}
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {['Documents', 'Electronics', 'Clothing', 'Food', 'Other'].map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your package..."
                  placeholderTextColor={Theme.colors['gray-400']}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Package Images (Min 1, Max 5) *</Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.selectedImageContainer}>
                    <Image source={{ uri }} style={styles.selectedImage} />
                    <Pressable style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                      <X size={16} color={Theme.colors.white} />
                    </Pressable>
                  </View>
                ))}
                
                {images.length < 5 && (
                  <Pressable style={styles.imageUploadBoxMini} onPress={pickImage}>
                    <Camera size={24} color={Theme.colors.teal} />
                    <Text style={[styles.imageUploadText, { fontSize: 11 }]}>{images.length === 0 ? 'Upload' : 'Add'}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Pressable
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleCreateShipment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Create Shipment</Text>
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
    backgroundColor: Theme.colors['off-white'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors['gray-100'],
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors['gray-50'],
    borderRadius: 20,
  },
  headerTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 18,
    color: Theme.colors.navy,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  formSection: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 16,
    color: Theme.colors.navy,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-600'],
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors['gray-50'],
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  textAreaWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    height: '100%',
  },
  textArea: {
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageUploadBox: {
    height: 120,
    borderWidth: 1.5,
    borderColor: Theme.colors['teal-light'],
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors.teal,
    marginTop: 8,
  },
  selectedImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadBoxMini: {
    width: 80,
    height: 80,
    borderWidth: 1.5,
    borderColor: Theme.colors['teal-light'],
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Theme.colors['gray-50'],
    borderWidth: 1,
    borderColor: Theme.colors['gray-200'],
  },
  categoryChipSelected: {
    backgroundColor: Theme.colors.teal,
    borderColor: Theme.colors.teal,
  },
  categoryChipText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-600'],
  },
  categoryChipTextSelected: {
    color: Theme.colors.white,
  },
  submitBtn: {
    backgroundColor: Theme.colors.teal,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBtnText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 16,
    color: Theme.colors.white,
  },
});
