import React from 'react';
import { StyleSheet, View, ViewStyle, useColorScheme, StyleProp } from 'react-native';
import { Colors, Radius } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: scheme === 'dark' ? 'rgba(21, 31, 50, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          borderColor: scheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          shadowColor: activeColors.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3, // for Android
    overflow: 'hidden',
  },
});
