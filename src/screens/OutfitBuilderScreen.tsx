import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showDialog } from '../utils/dialog';
import { Chip, ChipRow, EmptyState, Field, ItemThumb, PrimaryButton, Section } from '../components/ui';
import { MAIN_CATEGORIES, OCCASIONS } from '../data/constants';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { MainCategory, Occasion } from '../types';

export default function OutfitBuilderScreen({ navigation }: any) {
  const items = useAppStore((s) => s.items);
  const addOutfit = useAppStore((s) => s.addOutfit);

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [occasion, setOccasion] = useState<Occasion | undefined>();
  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState<MainCategory | 'wszystko'>('wszystko');

  const filtered = useMemo(
    () => (category === 'wszystko' ? items : items.filter((i) => i.mainCategory === category)),
    [items, category]
  );

  const toggleItem = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = () => {
    if (selected.length < 2) {
      showDialog('Za mało rzeczy', 'Kompozycja powinna mieć przynajmniej 2 elementy.');
      return;
    }
    addOutfit({
      name: name.trim() || `Moja kompozycja · ${new Date().toLocaleDateString('pl-PL')}`,
      itemIds: selected,
      occasion,
      note: note.trim() || undefined,
      favorite: false,
      source: 'własna',
    });
    navigation.goBack();
  };

  if (items.length === 0) {
    return (
      <View style={[s.container, { justifyContent: 'center' }]}>
        <EmptyState
          icon="wardrobe-outline"
          text="Twoja szafa jest pusta — nie ma z czego ułożyć kompozycji. Najpierw dodaj swoje ubrania, buty i akcesoria."
        />
        <View style={{ paddingHorizontal: 24 }}>
          <PrimaryButton
            title="Przejdź do szafy i dodaj rzeczy"
            icon="plus"
            onPress={() => navigation.navigate('Szafa', { screen: 'ItemForm', params: {} })}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Field label="Nazwa kompozycji" value={name} onChangeText={setName} placeholder="np. Piątkowe wyjście" />
      <Field label="Notatka" value={note} onChangeText={setNote} placeholder="np. dodać czerwoną szminkę" />

      <Section title="Okazja (opcjonalnie)">
        <ChipRow>
          {OCCASIONS.map((o) => (
            <Chip
              key={o.key}
              label={o.label}
              icon={o.icon}
              selected={occasion === o.key}
              onPress={() => setOccasion(occasion === o.key ? undefined : o.key)}
            />
          ))}
        </ChipRow>
      </Section>

      <Section title={`Wybierz rzeczy (${selected.length} zaznaczone)`}>
        <ChipRow>
          <Chip label="Wszystko" selected={category === 'wszystko'} onPress={() => setCategory('wszystko')} />
          {MAIN_CATEGORIES.map((c) => (
            <Chip key={c.key} label={c.label} icon={c.icon} selected={category === c.key} onPress={() => setCategory(c.key)} />
          ))}
        </ChipRow>
        <View style={s.grid}>
          {filtered.map((item) => {
            const isSel = selected.includes(item.id);
            return (
              <TouchableOpacity key={item.id} style={[s.gridItem, isSel && s.gridItemSelected]} onPress={() => toggleItem(item.id)}>
                <ItemThumb item={item} size={80} />
                {isSel && (
                  <View style={s.check}>
                    <MaterialCommunityIcons name="check-circle" size={22} color={theme.colors.primary} />
                  </View>
                )}
                <Text numberOfLines={1} style={s.gridLabel}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {filtered.length === 0 && (
          <Text style={{ color: theme.colors.textMuted }}>Brak rzeczy w tej kategorii — dodaj je w zakładce Szafa.</Text>
        )}
      </Section>

      <PrimaryButton title="Zapisz kompozycję" icon="content-save-outline" onPress={save} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  gridItem: {
    width: 92,
    margin: 4,
    padding: 5,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  gridItemSelected: { borderColor: theme.colors.primary, backgroundColor: '#F7EAEC' },
  check: { position: 'absolute', top: 2, right: 2, backgroundColor: '#fff', borderRadius: 11 },
  gridLabel: { fontSize: 11, color: theme.colors.text, marginTop: 3, maxWidth: 84 },
});
