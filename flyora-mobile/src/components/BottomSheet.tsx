import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, useColorScheme, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Radius, Spacing } from '../constants/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Slide up
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      backdropOpacity.value = withTiming(0.5, { duration: 250 });
    } else {
      // Slide down
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const closeSheet = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  };

  // Drag Gesture
  const dragGesture = Gesture.Pan()
    .onChange((event) => {
      // Drag down only
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 500) {
        runOnJS(closeSheet)();
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={closeSheet}>
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={styles.flex1} onPress={closeSheet} />
        </Animated.View>

        {/* Sheet Content */}
        <GestureDetector gesture={dragGesture}>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: activeColors.card,
                borderColor: activeColors.border,
                height: SHEET_HEIGHT,
              },
              animatedSheetStyle,
            ]}
          >
            {/* Grab Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: activeColors.border }]} />
            </View>

            {/* Header */}
            {title && (
              <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
                <Text style={[styles.headerText, { color: activeColors.text }]}>{title}</Text>
              </View>
            )}

            {/* Inner Content */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
  },
  flex1: {
    flex: 1,
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: '800',
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: Spacing.four,
  },
});
