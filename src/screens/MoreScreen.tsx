import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showDialog } from '../utils/dialog';
import GapSuggestions from '../components/GapSuggestions';
import { Card, Chip, ChipRow, PrimaryButton, Section } from '../components/ui';
import { STYLES } from '../data/constants';
import { analyzeGaps } from '../logic/gaps';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';

const THEME_OPTIONS: { key: 'system' | 'light' | 'dark'; label: string; icon: string }[] = [
  { key: 'system', label: 'System', icon: 'theme-light-dark' },
  { key: 'light', label: 'Jasny', icon: 'white-balance-sunny' },
  { key: 'dark', label: 'Ciemny', icon: 'weather-night' },
];

export default function MoreScreen() {
  const { theme } = useTheme();
  const s = useThemedStyles(makeStyles);
  const items = useAppStore((st) => st.items);
  const stores = useAppStore((st) => st.stores);
  const expenses = useAppStore((st) => st.expenses);
  const prefs = useAppStore((st) => st.prefs);
  const setPrefs = useAppStore((st) => st.setPrefs);
  const addStore = useAppStore((st) => st.addStore);
  const removeStore = useAppStore((st) => st.removeStore);
  const toggleStoreFavorite = useAppStore((st) => st.toggleStoreFavorite);
  const addExpense = useAppStore((st) => st.addExpense);
  const removeExpense = useAppStore((st) => st.removeExpense);
  const resetOnboarding = useAppStore((st) => st.resetOnboarding);
  const themeMode = useAppStore((st) => st.themeMode);
  const setThemeMode = useAppStore((st) => st.setThemeMode);

  const [showGaps, setShowGaps] = useState(false);
  const [newStore, setNewStore] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [budget, setBudget] = useState(prefs.monthlyBudget ? String(prefs.monthlyBudget) : '');

  const gaps = useMemo(() => (showGaps ? analyzeGaps(items, stores) : []), [showGaps, items, stores]);

  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const wardrobeValue = items.reduce((sum, i) => sum + (i.price ?? 0), 0);

  const saveBudget = () => {
    const val = Number(budget.replace(',', '.'));
    setPrefs({ monthlyBudget: isNaN(val) || val <= 0 ? undefined : val });
    showDialog('Zapisano', 'Budżet miesięczny został zaktualizowany.');
  };

  const addNewExpense = () => {
    const amount = Number(expAmount.replace(',', '.'));
    if (!expTitle.trim() || isNaN(amount) || amount <= 0) {
      showDialog('Wydatek', 'Podaj nazwę i poprawną kwotę.');
      return;
    }
    addExpense({ title: expTitle.trim(), amount, date: new Date().toISOString().slice(0, 10) });
    setExpTitle('');
    setExpAmount('');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Section title="Wygląd">
        <Text style={s.hint}>Motyw aplikacji. „System" dopasowuje się do ustawień telefonu/przeglądarki.</Text>
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
                <MaterialCommunityIcons
                  name={opt.icon as any}
                  size={18}
                  color={active ? theme.colors.onPrimary : theme.colors.text}
                />
                <Text style={[s.segmentText, active && { color: theme.colors.onPrimary, fontWeight: '700' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="Mój styl">
        <Text style={s.hint}>Ulubione style są podpowiadane styliście przy każdej propozycji.</Text>
        <ChipRow>
          {STYLES.map((st) => (
            <Chip
              key={st}
              label={st}
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

      <Section title="Czego brakuje w szafie?">
        <Card>
          <View style={s.switchRow}>
            <Text style={{ color: theme.colors.text, flex: 1 }}>Pokaż analizę braków i sugestie zakupów</Text>
            <Switch value={showGaps} onValueChange={setShowGaps} trackColor={{ true: theme.colors.primary }} />
          </View>
          {showGaps && gaps.length === 0 && (
            <Text style={{ color: theme.colors.accent, marginTop: 8 }}>
              Świetnie! Twoja szafa pokrywa wszystkie podstawowe potrzeby. 👏
            </Text>
          )}
          {showGaps && gaps.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <GapSuggestions gaps={gaps} />
            </View>
          )}
        </Card>
      </Section>

      <Section title="Budżet i wydatki">
        <Card>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Wartość szafy</Text>
            <Text style={s.statValue}>{wardrobeValue.toFixed(2)} zł</Text>
          </View>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Wydatki w tym miesiącu</Text>
            <Text style={[s.statValue, prefs.monthlyBudget && monthTotal > prefs.monthlyBudget ? { color: theme.colors.danger } : null]}>
              {monthTotal.toFixed(2)} zł{prefs.monthlyBudget ? ` / ${prefs.monthlyBudget.toFixed(0)} zł` : ''}
            </Text>
          </View>
          {prefs.monthlyBudget && monthTotal > prefs.monthlyBudget ? (
            <Text style={{ color: theme.colors.danger, fontSize: 13, marginBottom: 6 }}>Przekroczono budżet miesięczny!</Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[s.input, { flex: 1, marginRight: 8 }]}
              placeholder="Budżet miesięczny (zł)"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />
            <PrimaryButton title="Zapisz" onPress={saveBudget} />
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>Dodaj wydatek</Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TextInput
              style={[s.input, { flex: 1, marginRight: 8 }]}
              placeholder="np. Apaszka"
              placeholderTextColor={theme.colors.textMuted}
              value={expTitle}
              onChangeText={setExpTitle}
            />
            <TextInput
              style={[s.input, { width: 90 }]}
              placeholder="zł"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={expAmount}
              onChangeText={setExpAmount}
            />
          </View>
          <PrimaryButton title="Dodaj" icon="plus" variant="outline" onPress={addNewExpense} />
          {expenses.slice(0, 10).map((e) => (
            <View key={e.id} style={s.expenseRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text }}>{e.title}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                  {e.date}
                  {e.store ? ` · ${e.store}` : ''}
                </Text>
              </View>
              <Text style={{ color: theme.colors.text, fontWeight: '600', marginRight: 10 }}>{e.amount.toFixed(2)} zł</Text>
              <TouchableOpacity onPress={() => removeExpense(e.id)} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Moje sklepy">
        <Card>
          <Text style={s.hint}>Ulubione sklepy (serduszko) podpowiadamy przy brakach w szafie.</Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TextInput
              style={[s.input, { flex: 1, marginRight: 8 }]}
              placeholder="np. Zalando"
              placeholderTextColor={theme.colors.textMuted}
              value={newStore}
              onChangeText={setNewStore}
            />
            <PrimaryButton
              title="Dodaj"
              onPress={() => {
                if (newStore.trim()) {
                  addStore(newStore.trim());
                  setNewStore('');
                }
              }}
            />
          </View>
          {stores.map((st) => (
            <View key={st.id} style={s.expenseRow}>
              <Text style={{ flex: 1, color: theme.colors.text }}>{st.name}</Text>
              <TouchableOpacity onPress={() => toggleStoreFavorite(st.id)} hitSlop={10} style={{ marginRight: 12 }}>
                <MaterialCommunityIcons
                  name={st.favorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={st.favorite ? theme.colors.primary : theme.colors.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeStore(st.id)} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="O aplikacji">
        <PrimaryButton
          title="Pokaż wprowadzenie ponownie"
          icon="information-outline"
          variant="outline"
          onPress={resetOnboarding}
        />
      </Section>
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  cardTitle: { fontWeight: '700', color: theme.colors.text, marginBottom: 8, fontSize: 15 },
  hint: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
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
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { color: theme.colors.textMuted },
  statValue: { color: theme.colors.text, fontWeight: '700' },
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
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 8,
  },
});
