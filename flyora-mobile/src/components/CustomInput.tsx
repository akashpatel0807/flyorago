import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  iconLeft,
  iconRight,
  autoCapitalize = 'none',
  style,
}) => {
  const scheme = useColorScheme();
  const activeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: activeColors.text }]}>{label}</Text>}
      
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: activeColors.card,
            borderColor: error
              ? activeColors.error
              : isFocused
              ? activeColors.primary
              : activeColors.border,
          },
        ]}
      >
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
        
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={activeColors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, { color: activeColors.text }]}
        />

        {isPassword ? (
          <Pressable style={styles.iconRight} onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={18} color={activeColors.textSecondary} />
            ) : (
              <Eye size={18} color={activeColors.textSecondary} />
            )}
          </Pressable>
        ) : (
          iconRight && <View style={styles.iconRight}>{iconRight}</View>
        )}
      </View>
      
      {error && <Text style={[styles.errorText, { color: activeColors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.one * 1.5,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.large,
    height: 50,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
