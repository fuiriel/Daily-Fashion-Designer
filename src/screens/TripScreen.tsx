import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, EmptyState, ItemThumb, PrimaryButton } from '../components/ui';
import { useI18n } from '../i18n';
import { buildPackingList, PackingList } from '../logic/packing';
import { fetchDailyForecast, geocodeCity } from '../services/weather';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { showDialog } from '../utils/dialog';
import { isItemActive } from '../types';

export default function TripScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const allItems = useAppStore((st) => st.items);
  const items = useMemo(() => allItems.filter(isItemActive), [allItems]);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('7');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PackingList | null>(null);

  const plan = async () => {
    const d = Math.max(1, Math.min(Number(days) || 7, 16));
    if (!destination.trim()) {
      showDialog(t('trip.needDestTitle'), t('trip.needDestMsg'));
      return;
    }
    if (items.length === 0) {
      showDialog(t('trip.emptyTitle'), t('trip.emptyMsg'));
      return;
    }
    setLoading(true);
    try {
      const geo = await geocodeCity(destination.trim());
      if (!geo) throw new Error(t('trip.placeNotFound'));
      const forecast = await fetchDailyForecast(geo.latitude, geo.longitude, d);
      if (!forecast.length) throw new Error(t('trip.noForecast'));
      setResult(buildPackingList(items, forecast, d, `${geo.name}, ${geo.country}`, lang));
    } catch (e: any) {
      showDialog(t('trip.errorTitle'), e?.message ?? t('trip.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <Card>
        <Text style={s.cardTitle}>{t('trip.title')}</Text>
        <Text style={{ color: theme.colors.textMuted, marginBottom: 10, fontSize: 13 }}>{t('trip.hint')}</Text>
        <TextInput
          style={s.input}
          placeholder={t('trip.destination')}
          placeholderTextColor={theme.colors.textMuted}
          value={destination}
          onChangeText={setDestination}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 12 }}>
          <Text style={{ color: theme.colors.text, marginRight: 8 }}>{t('trip.days')}</Text>
          <TextInput style={[s.input, { width: 70 }]} keyboardType="numeric" value={days} onChangeText={setDays} />
          <Text style={{ color: theme.colors.textMuted, marginLeft: 8, fontSize: 12 }}>{t('trip.daysHint')}</Text>
        </View>
        <PrimaryButton title={t('trip.plan')} icon="bag-suitcase" onPress={plan} />
        {loading && <ActivityIndicator style={{ marginTop: 10 }} color={theme.colors.primary} />}
      </Card>

      {result && (
        <>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="airplane" size={22} color={theme.colors.accent} style={{ marginRight: 8 }} />
              <Text style={{ flex: 1, color: theme.colors.text, fontWeight: '600' }}>{result.summary}</Text>
            </View>
          </Card>

          {result.toPack.map((group) => (
            <Card key={group.slot}>
              <Text style={s.cardTitle}>
                {group.label} ({group.items.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {group.items.map((it) => (
                  <View key={it.id} style={{ marginRight: 10, alignItems: 'center', width: 70 }}>
                    <ItemThumb
                      item={it}
                      size={66}
                      onPress={() => navigation.navigate('Szafa', { screen: 'ItemDetail', params: { id: it.id } })}
                    />
                    <Text numberOfLines={1} style={{ fontSize: 11, color: theme.colors.text, marginTop: 2 }}>
                      {it.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </Card>
          ))}

          {result.toPack.length === 0 && <EmptyState icon="bag-suitcase-off-outline" text={t('trip.nothingFits')} />}

          {result.missing.length > 0 && (
            <Card style={{ borderColor: theme.colors.danger }}>
              <Text style={[s.cardTitle, { color: theme.colors.danger }]}>{t('trip.buyBefore')}</Text>
              {result.missing.map((m, i) => (
                <Text key={i} style={{ color: theme.colors.text, marginBottom: 4 }}>
                  • {m}
                </Text>
              ))}
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    cardTitle: { fontWeight: '700', color: theme.colors.text, marginBottom: 8, fontSize: 15 },
    input: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 15,
      color: theme.colors.text,
    },
  });
