import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card, Chip, ChipRow, PrimaryButton, Section } from '../components/ui';
import { STYLES } from '../data/constants';
import { analyzeGaps } from '../logic/gaps';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

export default function MoreScreen() {
  const items = useAppStore((s) => s.items);
  const stores = useAppStore((s) => s.stores);
  const expenses = useAppStore((s) => s.expenses);
  const prefs = useAppStore((s) => s.prefs);
  const setPrefs = useAppStore((s) => s.setPrefs);
  const addStore = useAppStore((s) => s.addStore);
  const removeStore = useAppStore((s) => s.removeStore);
  const toggleStoreFavorite = useAppStore((s) => s.toggleStoreFavorite);
  const addExpense = useAppStore((s) => s.addExpense);
  const removeExpense = useAppStore((s) => s.removeExpense);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);

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
    Alert.alert('Zapisano', 'Budżet miesięczny został zaktualizowany.');
  };

  const addNewExpense = () => {
    const amount = Number(expAmount.replace(',', '.'));
    if (!expTitle.trim() || isNaN(amount) || amount <= 0) {
      Alert.alert('Wydatek', 'Podaj nazwę i poprawną kwotę.');
      return;
    }
    addExpense({ title: expTitle.trim(), amount, date: new Date().toISOString().slice(0, 10) });
    setExpTitle('');
    setExpAmount('');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
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
          {showGaps &&
            gaps.map((g, i) => (
              <View key={i} style={s.gapRow}>
                <MaterialCommunityIcons name="cart-plus" size={20} color={theme.colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: theme.colors.text }}>{g.what}</Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{g.why}</Text>
                  <Text style={{ color: theme.colors.accent, fontSize: 13 }}>Gdzie kupić: {g.whereToBuy.join(', ')}</Text>
                </View>
              </View>
            ))}
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  cardTitle: { fontWeight: '700', color: theme.colors.text, marginBottom: 8, fontSize: 15 },
  hint: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  gapRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
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
