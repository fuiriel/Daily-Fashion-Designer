import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EmptyState, ItemThumb } from '../components/ui';
import { OCCASIONS } from '../data/constants';
import { useI18n } from '../i18n';
import { occasionLabel } from '../i18n/labels';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { showDialog } from '../utils/dialog';
import { Outfit } from '../types';

export default function OutfitsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const outfits = useAppStore((st) => st.outfits);
  const items = useAppStore((st) => st.items);
  const toggleFavorite = useAppStore((st) => st.toggleOutfitFavorite);
  const removeOutfit = useAppStore((st) => st.removeOutfit);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const list = onlyFavorites ? outfits.filter((o) => o.favorite) : outfits;

  const confirmDelete = (o: Outfit) =>
    showDialog(t('outfits.deleteTitle'), `„${o.name}"`, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeOutfit(o.id) },
    ]);

  const renderOutfit = ({ item: outfit }: { item: Outfit }) => {
    const outfitItems = outfit.itemIds
      .map((id) => items.find((i) => i.id === id))
      .filter((x): x is NonNullable<typeof x> => !!x);
    const occPl = outfit.occasion ? OCCASIONS.find((x) => x.key === outfit.occasion)?.label ?? outfit.occasion : undefined;
    return (
      <View style={s.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{outfit.name}</Text>
            <Text style={s.sub}>
              {outfit.source === 'stylista' ? t('outfits.fromStylist') : t('outfits.own')}
              {outfit.occasion ? ` · ${occasionLabel(lang, outfit.occasion, occPl!)}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Kalendarz', { planOutfitId: outfit.id })}
            hitSlop={10}
            style={{ marginRight: 12 }}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="calendar-plus" size={23} color={theme.colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleFavorite(outfit.id)} hitSlop={10} style={{ marginRight: 12 }} accessibilityRole="button">
            <MaterialCommunityIcons
              name={outfit.favorite ? 'heart' : 'heart-outline'}
              size={24}
              color={outfit.favorite ? theme.colors.primary : theme.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(outfit)} hitSlop={10} accessibilityRole="button">
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
          {outfitItems.length === 0 && <Text style={{ color: theme.colors.textMuted }}>{t('outfits.removed')}</Text>}
        </ScrollView>
        {outfit.note ? <Text style={s.note}>{outfit.note}</Text> : null}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={[{ flexDirection: 'row', padding: 16, paddingBottom: 4 }, contentStyle ? [contentStyle, { width: '100%' }] : null]}>
        <TouchableOpacity
          onPress={() => setOnlyFavorites(!onlyFavorites)}
          style={[s.filterBtn, onlyFavorites && { backgroundColor: theme.colors.primary }]}
          accessibilityRole="button"
          accessibilityState={{ selected: onlyFavorites }}
        >
          <MaterialCommunityIcons name="heart" size={16} color={onlyFavorites ? theme.colors.onPrimary : theme.colors.text} />
          <Text style={{ marginLeft: 6, color: onlyFavorites ? theme.colors.onPrimary : theme.colors.text, fontSize: 13 }}>
            {t('outfits.onlyFavorites')}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={list}
        keyExtractor={(o) => o.id}
        renderItem={renderOutfit}
        contentContainerStyle={[{ padding: 16, paddingBottom: 90 }, contentStyle]}
        ListEmptyComponent={<EmptyState icon="hanger" text={t('outfits.empty')} />}
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('OutfitBuilder')}
        accessibilityRole="button"
        accessibilityLabel={t('outfits.new')}
      >
        <MaterialCommunityIcons name="plus" size={30} color={theme.colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
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
