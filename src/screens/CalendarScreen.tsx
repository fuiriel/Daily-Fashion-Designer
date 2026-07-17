import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Chip, ChipRow, EmptyState, ItemThumb, PrimaryButton } from '../components/ui';
import { TIMES_OF_DAY } from '../data/constants';
import { DailyForecast, fetchDailyForecast, geocodeCity } from '../services/weather';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { Outfit, TimeOfDay } from '../types';

const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];

function toISO(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// dni miesiąca w tygodniach zaczynających się od poniedziałku
function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // pon=0 ... nd=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarScreen({ navigation, route }: any) {
  const outfits = useAppStore((s) => s.outfits);
  const items = useAppStore((s) => s.items);
  const plans = useAppStore((s) => s.plans);
  const addPlan = useAppStore((s) => s.addPlan);
  const removePlan = useAppStore((s) => s.removePlan);
  const prefs = useAppStore((s) => s.prefs);

  const today = new Date();
  const todayISO = toISO(today);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTime, setPickerTime] = useState<TimeOfDay | undefined>();
  const [forecasts, setForecasts] = useState<Record<string, DailyForecast>>({});

  // wejście z zakładki Kompozycje: „Zaplanuj tę kompozycję" — wybierz dzień i potwierdź
  const [pendingOutfitId, setPendingOutfitId] = useState<string | undefined>();
  const planOutfitId: string | undefined = route.params?.planOutfitId;
  useEffect(() => {
    if (planOutfitId) {
      setPendingOutfitId(planOutfitId);
      navigation.setParams({ planOutfitId: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planOutfitId]);

  // prognoza dla najbliższych 16 dni, jeśli użytkowniczka podała miasto u Stylisty
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!prefs.city) return;
      try {
        const geo = await geocodeCity(prefs.city);
        if (!geo) return;
        const days = await fetchDailyForecast(geo.latitude, geo.longitude, 16);
        if (cancelled) return;
        const map: Record<string, DailyForecast> = {};
        for (const d of days) map[d.date] = d;
        setForecasts(map);
      } catch {
        // brak prognozy nie blokuje kalendarza
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prefs.city]);

  const grid = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const plansByDate = useMemo(() => {
    const map = new Map<string, typeof plans>();
    for (const p of plans) {
      const list = map.get(p.date) ?? [];
      list.push(p);
      map.set(p.date, list);
    }
    return map;
  }, [plans]);

  const dayPlans = plansByDate.get(selectedDate) ?? [];
  const dayForecast = forecasts[selectedDate];

  const changeMonth = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const outfitById = (id: string) => outfits.find((o) => o.id === id);

  const pickOutfit = (outfit: Outfit) => {
    addPlan({ date: selectedDate, outfitId: outfit.id, timeOfDay: pickerTime });
    setPickerVisible(false);
    setPickerTime(undefined);
  };

  const openPicker = () => {
    if (outfits.length === 0) {
      Alert.alert(
        'Brak kompozycji',
        'Najpierw zapisz kompozycję — poproś Stylistę o propozycję albo stwórz własną w zakładce Kompozycje.'
      );
      return;
    }
    setPickerVisible(true);
  };

  const confirmRemove = (planId: string, outfitName: string) =>
    Alert.alert('Usunąć z planu?', `„${outfitName}" zniknie z tego dnia.`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: () => removePlan(planId) },
    ]);

  const selectedDateObj = new Date(`${selectedDate}T12:00:00`);
  const selectedLabel = `${selectedDateObj.getDate()} ${MONTHS[selectedDateObj.getMonth()].toLowerCase()} ${selectedDateObj.getFullYear()}`;

  const pendingOutfit = pendingOutfitId ? outfitById(pendingOutfitId) : undefined;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {pendingOutfit && (
        <Card style={{ borderColor: theme.colors.primary }}>
          <Text style={s.planName}>Planowanie: {pendingOutfit.name}</Text>
          <Text style={[s.forecastHint, { marginTop: 2 }]}>
            Wybierz dzień w kalendarzu i potwierdź poniżej.
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <PrimaryButton
              title={`Zaplanuj na ${selectedLabel}`}
              icon="check"
              onPress={() => {
                addPlan({ date: selectedDate, outfitId: pendingOutfit.id });
                setPendingOutfitId(undefined);
              }}
              style={{ flex: 1, marginRight: 8 }}
            />
            <PrimaryButton title="Anuluj" variant="outline" onPress={() => setPendingOutfitId(undefined)} />
          </View>
        </Card>
      )}
      <Card>
        <View style={s.monthHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={10}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.monthTitle}>
            {MONTHS[cursor.month]} {cursor.year}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={10}>
            <MaterialCommunityIcons name="chevron-right" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={s.weekRow}>
          {WEEKDAYS.map((w) => (
            <Text key={w} style={s.weekday}>
              {w}
            </Text>
          ))}
        </View>
        <View style={s.daysGrid}>
          {grid.map((date, i) => {
            if (!date) return <View key={i} style={s.dayCell} />;
            const iso = toISO(date);
            const isSelected = iso === selectedDate;
            const isToday = iso === todayISO;
            const hasPlans = plansByDate.has(iso);
            return (
              <TouchableOpacity
                key={i}
                style={[s.dayCell, isSelected && s.daySelected, !isSelected && isToday && s.dayToday]}
                onPress={() => setSelectedDate(iso)}
              >
                <Text style={[s.dayNumber, isSelected && { color: '#fff', fontWeight: '700' }]}>
                  {date.getDate()}
                </Text>
                <View style={[s.dot, hasPlans && { backgroundColor: isSelected ? '#fff' : theme.colors.primary }]} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={s.dayTitle}>{selectedLabel}</Text>
        {dayForecast && (
          <View style={s.forecastBadge}>
            <MaterialCommunityIcons
              name={dayForecast.isRain ? 'weather-rainy' : dayForecast.isSnow ? 'weather-snowy' : 'weather-partly-cloudy'}
              size={16}
              color={theme.colors.accent}
            />
            <Text style={s.forecastText}>
              {dayForecast.tempMin}–{dayForecast.tempMax}°C
            </Text>
          </View>
        )}
      </View>
      {prefs.city && dayForecast && (
        <Text style={s.forecastHint}>
          Prognoza dla: {prefs.city} · {dayForecast.description}
          {dayForecast.precipitationProb >= 40 ? ` · opady ${dayForecast.precipitationProb}%` : ''}
        </Text>
      )}

      {dayPlans.length === 0 && (
        <EmptyState icon="calendar-blank-outline" text="Nic nie zaplanowano na ten dzień. Dodaj kompozycję poniżej." />
      )}
      {dayPlans.map((plan) => {
        const outfit = outfitById(plan.outfitId);
        if (!outfit) return null;
        const outfitItems = outfit.itemIds
          .map((id) => items.find((i) => i.id === id))
          .filter((x): x is NonNullable<typeof x> => !!x);
        const timeLabel = TIMES_OF_DAY.find((t) => t.key === plan.timeOfDay)?.label;
        return (
          <Card key={plan.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.planName}>{outfit.name}</Text>
                <Text style={s.planSub}>
                  {timeLabel ? `${timeLabel} · ` : ''}
                  {outfit.occasion ?? 'bez okazji'}
                  {outfit.favorite ? ' · ❤️' : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => confirmRemove(plan.id, outfit.name)} hitSlop={10}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {outfitItems.map((it) => (
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
        );
      })}

      <PrimaryButton title="Zaplanuj kompozycję na ten dzień" icon="calendar-plus" onPress={openPicker} />

      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalSheet}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[s.dayTitle, { flex: 1 }]}>Wybierz kompozycję · {selectedLabel}</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={s.forecastHint}>Pora dnia (opcjonalnie):</Text>
            <ChipRow>
              {TIMES_OF_DAY.map((t) => (
                <Chip
                  key={t.key}
                  label={t.label}
                  icon={t.icon}
                  selected={pickerTime === t.key}
                  onPress={() => setPickerTime(pickerTime === t.key ? undefined : t.key)}
                />
              ))}
            </ChipRow>
            <FlatList
              data={outfits}
              keyExtractor={(o) => o.id}
              style={{ marginTop: 4 }}
              renderItem={({ item: outfit }) => {
                const first = outfit.itemIds
                  .map((id) => items.find((i) => i.id === id))
                  .filter((x): x is NonNullable<typeof x> => !!x)
                  .slice(0, 4);
                return (
                  <TouchableOpacity style={s.pickerRow} onPress={() => pickOutfit(outfit)}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.planName}>
                        {outfit.favorite ? '❤️ ' : ''}
                        {outfit.name}
                      </Text>
                      <Text style={s.planSub}>
                        {outfit.source === 'stylista' ? 'od stylisty' : 'własna'}
                        {outfit.occasion ? ` · ${outfit.occasion}` : ''}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      {first.map((it) => (
                        <View key={it.id} style={{ marginLeft: 4 }}>
                          <ItemThumb item={it} size={36} />
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  daySelected: { backgroundColor: theme.colors.primary },
  dayToday: { borderWidth: 1.5, borderColor: theme.colors.primary },
  dayNumber: { fontSize: 14, color: theme.colors.text },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: 'transparent' },
  dayTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  forecastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.chipBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10,
  },
  forecastText: { marginLeft: 4, color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  forecastHint: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 },
  planName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  planSub: { fontSize: 12, color: theme.colors.textMuted },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: 16,
    maxHeight: '75%',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    marginBottom: 8,
  },
});
