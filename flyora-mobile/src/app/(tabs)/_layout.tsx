import React from 'react';
import { View, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import { Home, Package, Wallet, User, Plane } from 'lucide-react-native';
import Animated from 'react-native-reanimated';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <>

      <View style={[styles.tabBarContainer, { paddingBottom: Platform.OS === 'ios' ? Math.max(30, insets.bottom) : Math.max(16, insets.bottom + 10) }]}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            
            if (options.href === null) {
              return null;
            }

            const label = options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let icon;
            const color = isFocused ? Theme.colors.teal : Theme.colors['gray-400'];
            
            if (route.name === 'index') {
              icon = <Home size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
            } else if (route.name === 'shipments') {
              icon = <Package size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
            } else if (route.name === 'trips') {
              icon = <Plane size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
            } else if (route.name === 'wallet') {
              icon = <Wallet size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
            } else if (route.name === 'profile') {
              icon = <User size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
              >
                {icon}
                <Animated.Text style={[styles.tabLabel, { color }]}>
                  {label}
                </Animated.Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="shipments"
        options={{ title: 'Sender' }}
      />
      <Tabs.Screen
        name="trips"
        options={{ title: 'Traveller' }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ title: 'Wallet' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
      
      {/* Hidden Screens */}
      <Tabs.Screen
        name="create"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    zIndex: 110,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: Theme.colors.white,
    borderRadius: 35,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: Theme.colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    fontFamily: Theme.typography.bodySmall.fontFamily,
    fontSize: 10,
    marginTop: 4,
  },
});
