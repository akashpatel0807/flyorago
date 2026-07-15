import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '../store';
import { Colors, Radius, Spacing } from '../constants/theme';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TOAST_WIDTH = width - 32;

export const AnimatedToast: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { visible, message, type, hideToast } = useToastStore();

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Slide down and fade in
      translateY.value = withSpring(insets.top + 10, { damping: 12, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // Slide up and fade out
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, insets.top]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) return null;

  // Type configurations
  let toastBg: string = activeColors.navy;
  let Icon = Info;
  let iconColor = '#ffffff';

  if (type === 'success') {
    toastBg = activeColors.primary;
    Icon = CheckCircle;
  } else if (type === 'error') {
    toastBg = activeColors.error;
    Icon = AlertCircle;
  }

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: toastBg,
          width: TOAST_WIDTH,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <Icon size={20} color={iconColor} style={styles.icon} />
        <Text style={styles.text} numberOfLines={3}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: Radius.large,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
