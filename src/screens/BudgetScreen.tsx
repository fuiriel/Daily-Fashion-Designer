import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DatePickerField from '../components/DatePickerField';
import { Card, PrimaryButton, Section } from '../components/ui';
import { useI18n } from '../i18n';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { todayISO } from '../utils/date';
import { showDialog } from '../utils/dialog';

export default function BudgetScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
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

  const [newStore, setNewStore] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(todayISO());
  const [budget, setBudget] = useState(prefs.monthlyBudget ? String(prefs.monthlyBudget) : '');

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
    showDialog(t('budget.savedTitle'), t('budget.savedMsg'));
  };

  const addNewExpense = () => {
    const amount = Number(expAmount.replace(',', '.'));
    if (!expTitle.trim() || isNaN(amount) || amount <= 0) {
      showDialog(t('budget.invalidTitle'), t('budget.invalidMsg'));
      return;
    }
    addExpense({ title: expTitle.trim(), amount, date: expDate || todayISO() });
    setExpTitle('');
    setExpAmount('');
    setExpDate(todayISO());
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <Card>
        <View style={s.statRow}>
          <Text style={s.statLabel}>{t('budget.value')}</Text>
          <Text style={s.statValue}>{wardrobeValue.toFixed(2)} zł</Text>
        </View>
        <View style={s.statRow}>
          <Text style={s.statLabel}>{t('budget.thisMonth')}</Text>
          <Text
            style={[s.statValue, prefs.monthlyBudget && monthTotal > prefs.monthlyBudget ? { color: theme.colors.danger } : null]}
          >
            {monthTotal.toFixed(2)} zł{prefs.monthlyBudget ? ` / ${prefs.monthlyBudget.toFixed(0)} zł` : ''}
          </Text>
        </View>
        {prefs.monthlyBudget && monthTotal > prefs.monthlyBudget ? (
          <Text style={{ color: theme.colors.danger, fontSize: 13, marginBottom: 6 }}>{t('budget.over')}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[s.input, { flex: 1, marginRight: 8 }]}
            placeholder={t('budget.monthly')}
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />
          <PrimaryButton title={t('common.save')} onPress={saveBudget} />
        </View>
      </Card>

      <Card>
        <Text style={s.cardTitle}>{t('budget.addExpense')}</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <TextInput
            style={[s.input, { flex: 1, marginRight: 8 }]}
            placeholder={t('budget.expenseName')}
            placeholderTextColor={theme.colors.textMuted}
            value={expTitle}
            onChangeText={setExpTitle}
          />
          <TextInput
            style={[s.input, { width: 90 }]}
            placeholder={t('budget.amount')}
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            value={expAmount}
            onChangeText={setExpAmount}
          />
        </View>
        <DatePickerField label={t('budget.expenseDate')} value={expDate} onChange={setExpDate} />
        <PrimaryButton title={t('common.add')} icon="plus" variant="outline" onPress={addNewExpense} />
        {expenses.slice(0, 15).map((e) => (
          <View key={e.id} style={s.expenseRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text }}>{e.title}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                {e.date}
                {e.store ? ` · ${e.store}` : ''}
              </Text>
            </View>
            <Text style={{ color: theme.colors.text, fontWeight: '600', marginRight: 10 }}>{e.amount.toFixed(2)} zł</Text>
            <TouchableOpacity onPress={() => removeExpense(e.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('common.delete')}>
              <MaterialCommunityIcons name="close" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      <Section title={t('budget.stores')}>
        <Card>
          <Text style={s.hint}>{t('budget.storesHint')}</Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TextInput
              style={[s.input, { flex: 1, marginRight: 8 }]}
              placeholder={t('budget.storePlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              value={newStore}
              onChangeText={setNewStore}
            />
            <PrimaryButton
              title={t('common.add')}
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
              <TouchableOpacity onPress={() => toggleStoreFavorite(st.id)} hitSlop={10} style={{ marginRight: 12 }} accessibilityRole="button">
                <MaterialCommunityIcons
                  name={st.favorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={st.favorite ? theme.colors.primary : theme.colors.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeStore(st.id)} hitSlop={10} accessibilityRole="button">
                <MaterialCommunityIcons name="close" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </Section>
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    cardTitle: { fontWeight: '700', color: theme.colors.text, marginBottom: 8, fontSize: 15 },
    hint: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 8 },
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
