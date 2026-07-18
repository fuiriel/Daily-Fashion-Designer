import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip, ChipRow, ColorDots, EmptyState, ItemThumb } from '../components/ui';
import { MAIN_CATEGORIES } from '../data/constants';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle, useIsWide } from '../theme/responsive';
import { MainCategory, WardrobeItem } from '../types';

export default function WardrobeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const isWide = useIsWide();
  const items = useAppStore((s) => s.items);
  const toggleFavorite = useAppStore((s) => s.toggleItemFavorite);
  const [category, setCategory] = useState<MainCategory | 'wszystko' | 'ulubione'>('wszystko');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = items;
    if (category === 'ulubione') list = list.filter((i) => i.favorite);
    else if (category !== 'wszystko') list = list.filter((i) => i.mainCategory === category);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.subcategory.toLowerCase().includes(q) ||
          i.colors.some((c) => c.includes(q)) ||
          (i.description ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, category, query]);

  const renderItem = ({ item }: { item: WardrobeItem }) => (
    <TouchableOpacity
      style={[styles.row, isWide && { flex: 1, marginHorizontal: 6 }]}
      onPress={() => navigation.navigate('ItemDetail', { id: item.id })}
    >
      <ItemThumb item={item} size={64} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          {item.subcategory}
          {item.size ? ` · rozm. ${item.size}` : ''}
        </Text>
        <ColorDots colors={item.colors} />
      </View>
      <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={10}>
        <MaterialCommunityIcons
          name={item.favorite ? 'heart' : 'heart-outline'}
          size={24}
          color={item.favorite ? theme.colors.primary : theme.colors.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={contentStyle ? [contentStyle, { width: '100%' }] : undefined}>
        <TextInput
          style={styles.search}
          placeholder="Szukaj w szafie..."
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        <ChipRow style={{ paddingHorizontal: 16 }}>
          <Chip label="Wszystko" selected={category === 'wszystko'} onPress={() => setCategory('wszystko')} />
          {MAIN_CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              icon={c.icon}
              selected={category === c.key}
              onPress={() => setCategory(c.key)}
            />
          ))}
          <Chip label="Ulubione" icon="heart" selected={category === 'ulubione'} onPress={() => setCategory('ulubione')} />
        </ChipRow>
      </View>
      <FlatList
        key={isWide ? 'cols2' : 'cols1'}
        numColumns={isWide ? 2 : 1}
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={[{ padding: 16, paddingBottom: 90 }, contentStyle]}
        ListEmptyComponent={
          <EmptyState
            icon="wardrobe-outline"
            text={
              items.length === 0
                ? 'Twoja szafa jest pusta. Zrób zdjęcia swoich ubrań i dodaj je przyciskiem +'
                : 'Brak rzeczy spełniających filtry.'
            }
          />
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ItemForm', {})} accessibilityRole="button" accessibilityLabel="Dodaj rzecz">
        <MaterialCommunityIcons name="plus" size={30} color={theme.colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  search: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  name: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  sub: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
