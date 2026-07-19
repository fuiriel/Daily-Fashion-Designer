import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../i18n';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';

// Więcej (tylko wersja mobilna): przyciski przenoszące do modułów,
// które nie mieszczą się w dolnym menu.
export default function MoreScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();

  const items = [
    { key: 'Kalendarz', icon: 'calendar-heart', label: t('title.calendar') },
    { key: 'Budżet', icon: 'wallet-outline', label: t('title.budget') },
    { key: 'Wyjazd', icon: 'bag-suitcase', label: t('title.trip') },
    { key: 'Braki', icon: 'cart-heart', label: t('title.gaps') },
    { key: 'Ustawienia', icon: 'cog-outline', label: t('title.settings') },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <Text style={s.hint}>{t('more.menuHint')}</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={s.row}
          onPress={() => navigation.navigate(item.key)}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <View style={s.iconCircle}>
            <MaterialCommunityIcons name={item.icon as any} size={24} color={theme.colors.primary} />
          </View>
          <Text style={s.label}>{item.label}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    hint: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 12 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      marginBottom: 10,
      minHeight: 64,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    label: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.colors.text },
  });
