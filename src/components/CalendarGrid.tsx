import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import { MONTHS, monthGrid, toISO, WEEKDAYS } from '../utils/date';

interface Props {
  selectedISO: string;
  onSelect: (iso: string) => void;
  todayISO?: string;
  minISO?: string; // najwcześniejsza wybieralna data
  maxISO?: string; // najpóźniejsza wybieralna data (np. dziś — blokuje przyszłość)
  markedDates?: Set<string>; // dni z kropką
}

// Współdzielona siatka miesiąca — używana w kalendarzu stylizacji i w date-pickerze.
export default function CalendarGrid({
  selectedISO,
  onSelect,
  todayISO,
  minISO,
  maxISO,
  markedDates,
}: Props) {
  const initial = selectedISO ? new Date(`${selectedISO}T12:00:00`) : new Date();
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const grid = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);

  const changeMonth = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <View>
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
          const isSelected = iso === selectedISO;
          const isToday = iso === todayISO;
          const disabled = (maxISO && iso > maxISO) || (minISO && iso < minISO) || false;
          const marked = markedDates?.has(iso);
          return (
            <TouchableOpacity
              key={i}
              style={[s.dayCell, isSelected && s.daySelected, !isSelected && isToday && s.dayToday]}
              onPress={() => !disabled && onSelect(iso)}
              disabled={!!disabled}
            >
              <Text
                style={[
                  s.dayNumber,
                  disabled && s.dayDisabled,
                  isSelected && { color: '#fff', fontWeight: '700' },
                ]}
              >
                {date.getDate()}
              </Text>
              <View style={[s.dot, marked && { backgroundColor: isSelected ? '#fff' : theme.colors.primary }]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' },
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
  dayDisabled: { color: theme.colors.border },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: 'transparent' },
});
