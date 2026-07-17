import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showDialog } from '../utils/dialog';
import { EmptyState, ItemThumb } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { Outfit } from '../types';

export default function OutfitsScreen({ navigation }: any) {
  const outfits = useAppStore((s) => s.outfits);
  const items = useAppStore((s) => s.items);
  const toggleFavorite = useAppStore((s) => s.toggleOutfitFavorite);
  const removeOutfit = useAppStore((s) => s.removeOutfit);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const list = onlyFavorites ? outfits.filter((o) => o.favorite) : outfits;

  const confirmDelete = (o: Outfit) =>
    showDialog('Usunąć kompozycję?', `„${o.name}"`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: () => removeOutfit(o.id) },
    ]);

  const renderOutfit = ({ item: outfit }: { item: Outfit }) => {
    const outfitItems = outfit.itemIds
      .map((id) => items.find((i) => i.id === id))
      .filter((x): x is NonNullable<typeof x> => !!x);
    return (
      <View style={s.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{outfit.name}</Text>
            <Text style={s.sub}>
              {outfit.source === 'stylista' ? 'od stylisty' : 'własna'}
              {outfit.occasion ? ` · ${outfit.occasion}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Kalendarz', { planOutfitId: outfit.id })}
            hitSlop={10}
            style={{ marginRight: 12 }}
          >
            <MaterialCommunityIcons name="calendar-plus" size={23} color={theme.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleFavorite(outfit.id)} hitSlop={10} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons
              name={outfit.favorite ? 'heart' : 'heart-outline'}
              size={24}
              color={outfit.favorite ? theme.colors.primary : theme.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(outfit)} hitSlop={10}>
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
          {outfitItems.length === 0 && (
            <Text style={{ color: theme.colors.textMuted }}>Rzeczy z tej kompozycji zostały usunięte z szafy.</Text>
          )}
        </ScrollView>
        {outfit.note ? <Text style={s.note}>{outfit.note}</Text> : null}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={{ flexDirection: 'row', padding: 16, paddingBottom: 4 }}>
        <TouchableOpacity
          onPress={() => setOnlyFavorites(!onlyFavorites)}
          style={[s.filterBtn, onlyFavorites && { backgroundColor: theme.colors.primary }]}
        >
          <MaterialCommunityIcons name="heart" size={16} color={onlyFavorites ? '#fff' : theme.colors.text} />
          <Text style={{ marginLeft: 6, color: onlyFavorites ? '#fff' : theme.colors.text, fontSize: 13 }}>
            Tylko ulubione
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={list}
        keyExtractor={(o) => o.id}
        renderItem={renderOutfit}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ListEmptyComponent={
          <EmptyState
            icon="hanger"
            text="Nie masz jeszcze zapisanych kompozycji. Poproś Stylistę o propozycję albo stwórz własną przyciskiem +"
          />
        }
      />
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('OutfitBuilder')}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  name: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  sub: { fontSize: 12, color: theme.colors.textMuted },
  note: { marginTop: 8, color: theme.colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.chipBg,
  },
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
