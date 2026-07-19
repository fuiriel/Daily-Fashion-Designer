import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../i18n';
import { GAP_TEXTS } from '../i18n/labels';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { GapStoreLink, GapSuggestion } from '../types';

function storeUrl(store: GapStoreLink, query: string): string {
  if (store.url) return store.url;
  return `https://www.google.com/search?q=${encodeURIComponent(`${store.name} ${query}`)}`;
}

// Kafelki sugestii zakupów: wizualizacja części ubioru (ikona), tytuł, powód
// i klikalne sklepy otwierające ich strony internetowe. Z opcjonalnym
// przyciskiem dodania brakującej rzeczy do szafy (onAdd).
export default function GapSuggestions({
  gaps,
  limit,
  onAdd,
}: {
  gaps: GapSuggestion[];
  limit?: number;
  onAdd?: (gap: GapSuggestion) => void;
}) {
  const { theme } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { t, lang } = useI18n();
  const list = typeof limit === 'number' ? gaps.slice(0, limit) : gaps;

  return (
    <View style={s.wrap}>
      {list.map((g) => {
        const texts = GAP_TEXTS[lang][g.id] ?? GAP_TEXTS.pl[g.id] ?? { what: g.id, why: '' };
        return (
          <View key={g.id} style={s.tile}>
            <View style={s.iconCircle}>
              <MaterialCommunityIcons name={g.icon as any} size={30} color={theme.colors.primary} />
            </View>
            <Text style={s.what}>{texts.what}</Text>
            <Text style={s.why}>{texts.why}</Text>
            <Text style={s.whereLabel}>{t('common.whereToBuy')}</Text>
            <View style={s.storeRow}>
              {g.whereToBuy.map((store) => (
                <TouchableOpacity
                  key={store.name}
                  style={s.storeChip}
                  accessibilityRole="link"
                  accessibilityLabel={store.name}
                  onPress={() => Linking.openURL(storeUrl(store, texts.what))}
                >
                  <MaterialCommunityIcons name="open-in-new" size={12} color={theme.colors.accent} />
                  <Text style={s.storeText}>{store.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {onAdd && (
              <TouchableOpacity
                style={s.addBtn}
                onPress={() => onAdd(g)}
                accessibilityRole="button"
                accessibilityLabel={t('gaps.addThis')}
              >
                <MaterialCommunityIcons name="plus" size={15} color={theme.colors.onPrimary} />
                <Text style={s.addBtnText}>{t('gaps.addThis')}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
    tile: {
      flexGrow: 1,
      flexBasis: 220,
      maxWidth: 340,
      backgroundColor: theme.colors.cardAlt,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      margin: 5,
    },
    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    what: { fontWeight: '700', color: theme.colors.text, fontSize: 14, marginBottom: 2 },
    why: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 8 },
    whereLabel: { color: theme.colors.textMuted, fontSize: 11, marginBottom: 4 },
    storeRow: { flexDirection: 'row', flexWrap: 'wrap' },
    storeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 6,
      marginBottom: 6,
    },
    storeText: { color: theme.colors.accent, fontSize: 12, fontWeight: '600', marginLeft: 4 },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      paddingVertical: 9,
      marginTop: 8,
      minHeight: 40,
    },
    addBtnText: { color: theme.colors.onPrimary, fontSize: 13, fontWeight: '700', marginLeft: 4 },
  });
