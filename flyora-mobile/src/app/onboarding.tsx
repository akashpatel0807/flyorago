import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/theme';
import { useAuthStore } from '../store';
import { Plane, Tag, Truck, ShieldCheck, Shield, ArrowRight, Globe, CheckCircle } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  withSpring,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Ship Smarter,',
    titleHighlight: 'Travel Better.',
    subtitle: 'Send packages, save more and earn while you travel.',
    image: require('../../assets/images/girl1.png'),
    features: [
      { icon: Tag, title: 'Cheaper Shipping', desc: 'Up to 30% cheaper than couriers' },
      { icon: Truck, title: 'Real-time Tracking', desc: 'Live updates of your shipments' },
      { icon: ShieldCheck, title: 'Trusted & Secure', desc: 'Verified travelers & safe payments' },
    ]
  },
  {
    id: '2',
    title: 'Global Reach,',
    titleHighlight: 'Local Speed.',
    subtitle: 'Connect with verified travelers worldwide for fast delivery.',
    image: require('../../assets/images/onbording second screen.png'),
    features: [
      { icon: Globe, title: 'Worldwide Network', desc: 'Ship anywhere, anytime' },
      { icon: Plane, title: 'Flight Integration', desc: 'Match with upcoming flights' },
      { icon: Shield, title: 'Escrow Payments', desc: 'Money held safely until delivery' },
    ]
  },
  {
    id: '3',
    title: 'Join the Smart',
    titleHighlight: 'Community.',
    subtitle: 'Ready to revolutionize how you ship and travel?',
    image: require('../../assets/images/girl3.png'),
    features: [
      { icon: CheckCircle, title: 'Quick KYC', desc: 'Fast identity verification' },
      { icon: Tag, title: 'Zero Hidden Fees', desc: 'Transparent peer-to-peer pricing' },
      { icon: ShieldCheck, title: '24/7 Support', desc: 'We are always here to help' },
    ]
  }
];

// Reusable Slide Component with Parallax & Interpolation
const OnboardingSlide = ({ item, index, scrollX }: { item: any, index: number, scrollX: Animated.SharedValue<number> }) => {

  // Parallax animation for the image
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateX = interpolate(scrollX.value, inputRange, [width * 0.5, 0, -width * 0.5], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);

    return {
      transform: [{ translateX }, { scale }],
      opacity,
    };
  });

  // Staggered animation for the text content
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.slide}>
      {/* Top Image Section with Parallax */}
      <View style={styles.imageContainer}>
        <Animated.Image
          source={item.image}
          style={[styles.heroImage, imageAnimatedStyle]}
          resizeMode="contain"
        />
        {/* Decorative Background Blob - Hidden for 2nd screen if requested */}
        {item.id !== '2' && (
          <Animated.View style={[styles.blob, { opacity: imageAnimatedStyle.opacity }]} />
        )}
      </View>

      {/* Bottom Text Content Section */}
      <Animated.View style={[styles.textContainer, contentAnimatedStyle]}>
        <Text style={styles.title}>
          {item.title}{'\n'}
          <Text style={{ color: Theme.colors.teal }}>{item.titleHighlight}</Text>
        </Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        <View style={styles.featuresList}>
          {item.features.map((feat: any, idx: number) => (
            <View key={idx} style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <feat.icon size={18} color={Theme.colors.teal} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default function AdvancedOnboardingScreen() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/(auth)/signup');
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {ONBOARDING_DATA.map((_, i) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const widthAnim = interpolate(scrollX.value, [(i - 1) * width, i * width, (i + 1) * width], [8, 32, 8], Extrapolation.CLAMP);
            const opacityAnim = interpolate(scrollX.value, [(i - 1) * width, i * width, (i + 1) * width], [0.3, 1, 0.3], Extrapolation.CLAMP);
            const colorAnim = scrollX.value >= (i - 0.5) * width && scrollX.value <= (i + 0.5) * width ? Theme.colors.teal : Theme.colors['gray-300'];

            return {
              width: withSpring(widthAnim, { damping: 15, stiffness: 150 }),
              opacity: withSpring(opacityAnim),
              backgroundColor: colorAnim,
            };
          });

          return <Animated.View key={i} style={[styles.dot, animatedDotStyle]} />;
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header Logo */}
      <Animated.View style={styles.header} entering={FadeInDown.delay(100).duration(800)}>
        <View style={styles.logoGroup}>
          <Animated.Image
            source={require('../../assets/images/flyora logo png.png')}
            style={styles.headerLogoIcon}
            resizeMode="contain"
          />
          <Text style={styles.headerLogoText}>
            FLYORA<Text style={styles.headerLogoTextGo}>GO</Text>
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        {currentIndex < ONBOARDING_DATA.length - 1 && (
          <Pressable onPress={() => flatListRef.current?.scrollToIndex({ index: 2, animated: true })}>
            <Animated.Text style={styles.skipText}>Skip</Animated.Text>
          </Pressable>
        )}
      </Animated.View>

      {/* FlatList for Slides - Taking remaining space */}
      <View style={styles.sliderWrapper}>
        <Animated.FlatList
          ref={flatListRef as any}
          data={ONBOARDING_DATA}
          renderItem={({ item, index }) => (
            <OnboardingSlide item={item} index={index} scrollX={scrollX} />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>

      {/* Bottom Controls - Fixed footprint */}
      <View style={styles.bottomArea}>
        <Paginator />

        <View style={styles.buttonWrapper}>
          {currentIndex === ONBOARDING_DATA.length - 1 ? (
            <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.authButtonsContainer}>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }]}
                onPress={handleComplete}
              >
                <Text style={styles.primaryBtnText}>Get Started</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.springify().damping(15).delay(100)} style={styles.nextButtonContainer} key={`btn-${currentIndex}`}>
              <Pressable
                style={({ pressed }) => [styles.nextBtn, pressed && { transform: [{ scale: 0.96 }] }]}
                onPress={handleNext}
              >
                <Text style={styles.nextBtnText}>Next</Text>
                <View style={styles.nextIconCircle}>
                  <ArrowRight size={20} color={Theme.colors.white} />
                </View>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 5,
    zIndex: 10,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoIcon: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  headerLogoText: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.teal,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  headerLogoTextGo: {
    color: Theme.colors.navy,
  },
  skipText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 15,
    color: Theme.colors['gray-500'],
    fontWeight: '600',
  },
  sliderWrapper: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    height: height * 0.25,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 5,
  },
  blob: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#E8F5F3',
    borderRadius: 999,
    zIndex: -1,
    top: '10%',
  },
  heroImage: {
    width: width * 0.85,
    height: '95%',
  },
  textContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 28,
    paddingTop: 0,
  },
  title: {
    fontFamily: Theme.typography.h1.fontFamily,
    fontSize: 30,
    lineHeight: 36,
    color: Theme.colors.navy,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 15,
    color: Theme.colors['gray-500'],
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  featureIconBox: {
    width: 34,
    height: 34,
    backgroundColor: '#F0F9F8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E1F0EE',
  },
  featureTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 14,
    color: Theme.colors.navy,
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: Theme.typography.body.fontFamily,
    fontSize: 12,
    color: Theme.colors['gray-500'],
    lineHeight: 16,
  },
  bottomArea: {
    paddingHorizontal: 28,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
    minHeight: 140,
    justifyContent: 'flex-end',
  },
  paginatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButtonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  nextBtn: {
    backgroundColor: Theme.colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 60,
    paddingLeft: 24,
    paddingRight: 8,
    borderRadius: 30,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  nextBtnText: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 18,
    color: Theme.colors.white,
    paddingRight: 10,
    minWidth: 60,
  },
  nextIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButtonsContainer: {
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: Theme.colors.teal,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: Theme.colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    fontFamily: Theme.typography.h2.fontFamily,
    fontSize: 17,
    color: Theme.colors.white,
  },
  secondaryBtn: {
    backgroundColor: Theme.colors.white,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors['gray-200'],
    marginBottom: 16,
  },
  secondaryBtnText: {
    fontFamily: Theme.typography.h3.fontFamily,
    fontSize: 17,
    color: Theme.colors.navy,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  trustBadgeText: {
    fontFamily: Theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: Theme.colors['gray-500'],
    marginLeft: 6,
  },
});
