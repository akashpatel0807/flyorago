import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe, runOnJS } from 'react-native-reanimated';

const DURATION = 600;

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View style={styles.background} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  background: {
    borderRadius: 40,
    backgroundColor: '#0d9488',
    width: 128,
    height: 128,
    position: 'absolute',
  },
});
