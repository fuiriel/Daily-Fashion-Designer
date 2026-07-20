import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLOR_PALETTE } from '../data/constants';
import { subcategoryIcon } from '../data/icons';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { WardrobeItem } from '../types';

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon as any}
          size={14}
          color={selected ? theme.colors.onPrimary : theme.colors.text}
          style={{ marginRight: 4 }}
        />
      ) : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ChipRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.chipRow, style]}>{children}</View>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 70, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        accessibilityLabel={label}
      />
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'outline' | 'danger';
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bg =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
      ? theme.colors.danger
      : 'transparent';
  const fg = variant === 'outline' ? theme.colors.primary : theme.colors.onPrimary;
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.button,
        { backgroundColor: bg },
        variant === 'outline' && { borderWidth: 1.5, borderColor: theme.colors.primary },
        style,
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons name={icon as any} size={18} color={fg} style={{ marginRight: 6 }} />
      ) : null}
      <Text style={{ color: fg, fontWeight: '600', fontSize: 15 }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function ColorDots({ colors, size = 14 }: { colors: string[]; size?: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {colors.map((c) => {
        const hex = COLOR_PALETTE.find((p) => p.name === c)?.hex ?? '#ccc';
        return (
          <View
            key={c}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: hex,
              marginRight: 4,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          />
        );
      })}
    </View>
  );
}

export function ItemThumb({
  item,
  size = 72,
  onPress,
}: {
  item: WardrobeItem;
  size?: number;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const content = item.photoUri ? (
    <Image source={{ uri: item.photoUri }} style={{ width: size, height: size, borderRadius: theme.radius.sm }} />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.chipBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons
        name={subcategoryIcon(item.mainCategory, item.subcategory) as any}
        size={size * 0.45}
        color={theme.colors.textMuted}
      />
    </View>
  );
  if (!onPress) return content;
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="imagebutton" accessibilityLabel={item.name}>
      {content}
    </TouchableOpacity>
  );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: theme.spacing.xl }}>
      <MaterialCommunityIcons name={icon as any} size={48} color={theme.colors.textMuted} />
      <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 8, fontSize: 15 }}>
        {text}
      </Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.colors.chipBg,
      marginRight: 8,
      marginBottom: 8,
    },
    chipSelected: { backgroundColor: theme.colors.primary },
    chipText: { color: theme.colors.text, fontSize: 13 },
    chipTextSelected: { color: theme.colors.onPrimary, fontWeight: '600' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    fieldLabel: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 4 },
    input: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: theme.colors.text,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      paddingHorizontal: 18,
      borderRadius: theme.radius.md,
      minHeight: 44,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
