import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { GapSuggestion } from '../types';

// Lista sugestii zakupów (co warto dokupić i gdzie). Wspólna dla zakładki
// Więcej (analiza braków) i Stylisty (gdy nie da się złożyć zestawu).
export default function GapSuggestions({ gaps, limit }: { gaps: GapSuggestion[]; limit?: number }) {
  const { theme } = useTheme();
  const s = useThemedStyles(makeStyles);
  const list = typeof limit === 'number' ? gaps.slice(0, limit) : gaps;
  return (
    <View>
      {list.map((g, i) => (
        <View key={i} style={[s.row, i === 0 && { marginTop: 0, paddingTop: 0, borderTopWidth: 0 }]}>
          <MaterialCommunityIcons
            name="cart-plus"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 8, marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.what}>{g.what}</Text>
            <Text style={s.why}>{g.why}</Text>
            <Text style={s.where}>Gdzie kupić: {g.whereToBuy.join(', ')}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    what: { fontWeight: '600', color: theme.colors.text },
    why: { color: theme.colors.textMuted, fontSize: 13 },
    where: { color: theme.colors.accent, fontSize: 13 },
  });
