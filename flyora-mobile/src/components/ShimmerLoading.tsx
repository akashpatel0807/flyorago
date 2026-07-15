import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, useColorScheme, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Radius } from '../constants/theme';

interface ShimmerLoadingProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ShimmerLoading: React.FC<ShimmerLoadingProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Radius.small,
  style,
}) => {
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 850 }),
      -1, // infinite loop
      true // reverse path
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          width,
          height,
          borderRadius,
          backgroundColor: scheme === 'dark' ? '#27354f' : '#e2e8f0',
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  shimmer: {
    overflow: 'hidden',
  },
});
