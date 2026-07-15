import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../constants/theme';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'teal' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  variant = 'teal',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  style,
}) => {
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  };

  // Styles based on variant
  let btnBg: string = activeColors.primary;
  let btnBorder: string = 'transparent';
  let textCol: string = '#ffffff';

  if (variant === 'secondary') {
    btnBg = activeColors.backgroundElement;
    textCol = activeColors.text;
  } else if (variant === 'outline') {
    btnBg = 'transparent';
    btnBorder = activeColors.border;
    textCol = activeColors.text;
  } else if (variant === 'danger') {
    btnBg = activeColors.error;
    textCol = '#ffffff';
  }

  // Styles based on size
  let paddingVertical: number = Spacing.two;
  let paddingHorizontal: number = Spacing.three;
  let fontSize: number = 14;

  if (size === 'sm') {
    paddingVertical = 6;
    paddingHorizontal = 12;
    fontSize = 12;
  } else if (size === 'lg') {
    paddingVertical = 14;
    paddingHorizontal = 24;
    fontSize = 16;
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? activeColors.backgroundElement : btnBg,
          borderColor: btnBorder,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical,
          paddingHorizontal,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.6 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textCol} />
      ) : (
        <View style={styles.content}>
          {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
          <Text style={[styles.text, { color: disabled ? activeColors.textSecondary : textCol, fontSize }]}>
            {title}
          </Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.large,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
