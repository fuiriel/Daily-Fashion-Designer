import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { formatDatePl, todayISO } from '../utils/date';
import CalendarGrid from './CalendarGrid';
import { PrimaryButton } from './ui';

interface Props {
  label: string;
  value: string; // ISO yyyy-mm-dd lub ''
  onChange: (iso: string) => void;
  placeholder?: string;
  maxISO?: string; // domyślnie dziś — blokuje wybór daty z przyszłości
  minISO?: string;
}

// Pole daty z kalendarzem. Działa identycznie na telefonie i w przeglądarce
// (nie korzysta z natywnych modułów), a przyszłe dni są niewybieralne.
export default function DatePickerField({
  label,
  value,
  onChange,
  placeholder = 'Wybierz datę',
  maxISO,
  minISO,
}: Props) {
  const { theme } = useTheme();
  const s = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const today = todayISO();
  const max = maxISO ?? today;

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.input} onPress={() => setOpen(true)}>
        <MaterialCommunityIcons name="calendar-month-outline" size={18} color={theme.colors.textMuted} />
        <Text style={[s.value, !value && { color: theme.colors.textMuted }]}>
          {value ? formatDatePl(value) : placeholder}
        </Text>
        {value ? (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={10}>
            <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={s.sheet} onPress={() => {}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[s.label, { flex: 1, fontSize: 15, fontWeight: '700', color: theme.colors.text }]}>
                {label}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <CalendarGrid
              selectedISO={value}
              todayISO={today}
              maxISO={max}
              minISO={minISO}
              onSelect={(iso) => {
                onChange(iso);
                setOpen(false);
              }}
            />
            <Text style={s.hint}>Nie można wybrać daty z przyszłości.</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <PrimaryButton
                title="Dziś"
                variant="outline"
                onPress={() => {
                  onChange(today);
                  setOpen(false);
                }}
                style={{ flex: 1, marginRight: 8 }}
              />
              <PrimaryButton title="Wyczyść" variant="outline" onPress={() => { onChange(''); setOpen(false); }} style={{ flex: 1 }} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    label: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 4 },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 11,
    },
    value: { flex: 1, marginLeft: 8, fontSize: 15, color: theme.colors.text },
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      padding: 20,
    },
    sheet: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    hint: { color: theme.colors.textMuted, fontSize: 12, marginTop: 8 },
  });
