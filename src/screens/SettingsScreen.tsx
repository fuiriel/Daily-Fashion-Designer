import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chip, ChipRow, PrimaryButton, Section } from '../components/ui';
import { STYLES } from '../data/constants';
import { useI18n } from '../i18n';
import { styleLabel } from '../i18n/labels';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { Language } from '../types';

const THEME_OPTIONS = [
  { key: 'system', labelKey: 'more.themeSystem', icon: 'theme-light-dark' },
  { key: 'light', labelKey: 'more.themeLight', icon: 'white-balance-sunny' },
  { key: 'dark', labelKey: 'more.themeDark', icon: 'weather-night' },
] as const;

const LANGUAGES: { key: Language; label: string; flag: string }[] = [
  { key: 'pl', label: 'Polski', flag: '🇵🇱' },
  { key: 'en', label: 'English', flag: '🇬🇧' },
];

// Ustawienia aplikacji: motyw, język, ulubiony styl, „O aplikacji".
export default function SettingsScreen() {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const prefs = useAppStore((st) => st.prefs);
  const setPrefs = useAppStore((st) => st.setPrefs);
  const resetOnboarding = useAppStore((st) => st.resetOnboarding);
  const themeMode = useAppStore((st) => st.themeMode);
  const setThemeMode = useAppStore((st) => st.setThemeMode);
  const setLanguage = useAppStore((st) => st.setLanguage);

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <Section title={t('more.appearance')}>
        <Text style={s.hint}>{t('more.appearanceHint')}</Text>
        <View style={s.segment}>
          {THEME_OPTIONS.map((opt) => {
            const active = themeMode === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setThemeMode(opt.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[s.segmentBtn, active && s.segmentBtnActive]}
              >
                <MaterialCommunityIcons name={opt.icon as any} size={18} color={active ? theme.colors.onPrimary : theme.colors.text} />
                <Text style={[s.segmentText, active && { color: theme.colors.onPrimary, fontWeight: '700' }]}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title={t('more.language')}>
        <View style={s.segment}>
          {LANGUAGES.map((l) => {
            const active = lang === l.key;
            return (
              <TouchableOpacity
                key={l.key}
                onPress={() => setLanguage(l.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[s.segmentBtn, active && s.segmentBtnActive]}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>{l.flag}</Text>
                <Text style={[s.segmentText, active && { color: theme.colors.onPrimary, fontWeight: '700' }]}>{l.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title={t('more.myStyle')}>
        <Text style={s.hint}>{t('more.myStyleHint')}</Text>
        <ChipRow>
          {STYLES.map((st) => (
            <Chip
              key={st}
              label={styleLabel(lang, st)}
              selected={prefs.favoriteStyles.includes(st)}
              onPress={() =>
                setPrefs({
                  favoriteStyles: prefs.favoriteStyles.includes(st)
                    ? prefs.favoriteStyles.filter((x) => x !== st)
                    : [...prefs.favoriteStyles, st],
                })
              }
            />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('more.about')}>
        <PrimaryButton title={t('more.showOnboarding')} icon="information-outline" variant="outline" onPress={resetOnboarding} />
      </Section>
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    hint: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 8 },
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.colors.chipBg,
      borderRadius: theme.radius.md,
      padding: 4,
    },
    segmentBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: theme.radius.sm,
      minHeight: 44,
    },
    segmentBtnActive: { backgroundColor: theme.colors.primary },
    segmentText: { marginLeft: 6, color: theme.colors.text, fontSize: 14 },
  });
