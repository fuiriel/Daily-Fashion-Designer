import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import GapSuggestions from '../components/GapSuggestions';
import { Card } from '../components/ui';
import { useI18n } from '../i18n';
import { analyzeGaps } from '../logic/gaps';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { GapSuggestion } from '../types';
import { openItemForm } from '../utils/navigation';

// Moduł „Czego brakuje w szafie?" — kafelki braków z możliwością dodania
// brakującej rzeczy (formularz wstępnie wypełniony danymi z kafelka).
export default function GapsScreen({ navigation }: any) {
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const items = useAppStore((st) => st.items);
  const stores = useAppStore((st) => st.stores);
  const gaps = useMemo(() => analyzeGaps(items, stores), [items, stores]);

  const addFromGap = (gap: GapSuggestion) => {
    // otwórz formularz nowego przedmiotu z danymi z kafelka
    openItemForm(navigation, { prefill: gap.prefill, prefillKey: Date.now() });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <Text style={s.hint}>{t('gaps.hint')}</Text>
      {gaps.length === 0 ? (
        <Card>
          <Text style={s.allGood}>{t('more.gapsAllGood')}</Text>
        </Card>
      ) : (
        <GapSuggestions gaps={gaps} onAdd={addFromGap} />
      )}
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    hint: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 12, lineHeight: 18 },
    allGood: { color: theme.colors.accent, fontSize: 15 },
  });
