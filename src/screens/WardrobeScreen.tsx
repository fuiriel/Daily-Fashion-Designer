import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip, ChipRow, ColorDots, EmptyState, ItemThumb } from '../components/ui';
import { MAIN_CATEGORIES } from '../data/constants';
import { useI18n } from '../i18n';
import { categoryLabel, subcatLabel } from '../i18n/labels';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle, useIsWide } from '../theme/responsive';
import { showDialog } from '../utils/dialog';
import { isItemActive, MainCategory, WardrobeItem } from '../types';

type Filter = MainCategory | 'wszystko' | 'ulubione' | 'archiwum';

export default function WardrobeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const styles = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const isWide = useIsWide();
  const items = useAppStore((s) => s.items);
  const catalogs = useAppStore((s) => s.catalogs);
  const addCatalog = useAppStore((s) => s.addCatalog);
  const removeCatalog = useAppStore((s) => s.removeCatalog);
  const toggleFavorite = useAppStore((s) => s.toggleItemFavorite);
  const [filter, setFilter] = useState<Filter>('wszystko');
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [newCatalog, setNewCatalog] = useState('');
  const [manageCatalogs, setManageCatalogs] = useState(false);

  const filtered = useMemo(() => {
    let list = items;
    if (filter === 'archiwum') list = list.filter((i) => !isItemActive(i));
    else {
      list = list.filter(isItemActive);
      if (filter === 'ulubione') list = list.filter((i) => i.favorite);
      else if (filter !== 'wszystko') list = list.filter((i) => i.mainCategory === filter);
    }
    if (catalogId) list = list.filter((i) => i.catalogIds?.includes(catalogId));
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
  }, [items, filter, catalogId, query]);

  const confirmRemoveCatalog = (id: string, name: string) =>
    showDialog(t('wardrobe.removeCatalogTitle'), `„${name}" — ${t('wardrobe.removeCatalogMsg')}`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          removeCatalog(id);
          if (catalogId === id) setCatalogId(null);
        },
      },
    ]);

  const renderItem = ({ item }: { item: WardrobeItem }) => (
    <TouchableOpacity
      style={[styles.row, isWide && { flex: 1, marginHorizontal: 6 }]}
      onPress={() => navigation.navigate('ItemDetail', { id: item.id })}
    >
      <ItemThumb item={item} size={64} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          {subcatLabel(lang, item.subcategory)}
          {item.size ? ` · ${t('wardrobe.size')} ${item.size}` : ''}
        </Text>
        {!isItemActive(item) && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{t(`status.${item.status}` as any)}</Text>
          </View>
        )}
        <ColorDots colors={item.colors} />
      </View>
      <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={10} accessibilityRole="button">
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
          placeholder={t('wardrobe.search')}
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel={t('wardrobe.search')}
        />
        <ChipRow style={{ paddingHorizontal: 16 }}>
          <Chip label={t('wardrobe.all')} selected={filter === 'wszystko'} onPress={() => setFilter('wszystko')} />
          {MAIN_CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={categoryLabel(lang, c.key, c.label)}
              icon={c.icon}
              selected={filter === c.key}
              onPress={() => setFilter(c.key)}
            />
          ))}
          <Chip label={t('wardrobe.favorites')} icon="heart" selected={filter === 'ulubione'} onPress={() => setFilter('ulubione')} />
          <Chip label={t('wardrobe.archive')} icon="archive-outline" selected={filter === 'archiwum'} onPress={() => setFilter('archiwum')} />
        </ChipRow>

        {/* katalogi użytkownika */}
        <View style={styles.catalogHeader}>
          <Text style={styles.catalogTitle}>{t('wardrobe.catalogs')}</Text>
          <TouchableOpacity onPress={() => setManageCatalogs(!manageCatalogs)} hitSlop={10} accessibilityRole="button">
            <MaterialCommunityIcons
              name={manageCatalogs ? 'check' : 'pencil-outline'}
              size={18}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        <ChipRow style={{ paddingHorizontal: 16 }}>
          {catalogs.map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Chip
                label={manageCatalogs ? `${c.name} ✕` : c.name}
                icon="folder-outline"
                selected={catalogId === c.id}
                onPress={() =>
                  manageCatalogs ? confirmRemoveCatalog(c.id, c.name) : setCatalogId(catalogId === c.id ? null : c.id)
                }
              />
            </View>
          ))}
          {manageCatalogs && (
            <View style={styles.newCatalogRow}>
              <TextInput
                style={styles.newCatalogInput}
                placeholder={t('wardrobe.newCatalog')}
                placeholderTextColor={theme.colors.textMuted}
                value={newCatalog}
                onChangeText={setNewCatalog}
              />
              <TouchableOpacity
                onPress={() => {
                  if (newCatalog.trim()) {
                    addCatalog(newCatalog.trim());
                    setNewCatalog('');
                  }
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('common.add')}
              >
                <MaterialCommunityIcons name="plus-circle" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
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
            text={items.length === 0 ? t('wardrobe.emptyList') : t('wardrobe.noFilterResults')}
          />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ItemForm', {})}
        accessibilityRole="button"
        accessibilityLabel={t('wardrobe.addItem')}
      >
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
    catalogHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 2,
      marginBottom: 6,
    },
    catalogTitle: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '700', marginRight: 8 },
    newCatalogRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    newCatalogInput: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 13,
      color: theme.colors.text,
      minWidth: 170,
      marginRight: 6,
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
    statusBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.chipBg,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginBottom: 4,
    },
    statusBadgeText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
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
