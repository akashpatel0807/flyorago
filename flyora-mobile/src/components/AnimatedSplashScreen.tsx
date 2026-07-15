import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Props {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen = ({ onAnimationComplete }: Props) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // Entrance Animation
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    translateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) });

    // Exit Animation (after a short delay to let user see it)
    opacity.value = withDelay(
      1500,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 99999, // Ensure it covers everything
    backgroundColor: '#ffffff', // Match the app.json splash color
    justifyContent: 'center',
    alignItems: 'center',
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
    width: 200,
    height: 200,
  }));

  return (
    <Animated.View style={containerStyle} pointerEvents="none">
      <Animated.Image
        source={require('../../assets/images/flyorago-splash.png')}
        style={logoStyle}
        resizeMode="contain"
      />
    </Animated.View>
  );
};
