import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Chip, ChipRow, ColorDots, PrimaryButton } from '../components/ui';
import { ItemImage } from '../components/ItemImage';
import { useI18n } from '../i18n';
import {
  categoryLabel,
  occasionLabel,
  patternLabel,
  styleLabel,
  subcatLabel,
  warmthLabel,
} from '../i18n/labels';
import { OCCASIONS, MAIN_CATEGORIES } from '../data/constants';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { showDialog } from '../utils/dialog';
import { ItemStatus } from '../types';

const STATUSES: { key: ItemStatus; icon: string }[] = [
  { key: 'aktywna', icon: 'check-circle-outline' },
  { key: 'zarchiwizowana', icon: 'archive-outline' },
  { key: 'zwrócona', icon: 'keyboard-return' },
  { key: 'sprzedana', icon: 'cash' },
  { key: 'wyrzucona', icon: 'delete-empty-outline' },
];

export default function ItemDetailScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const id: string = route.params.id;
  const item = useAppStore((st) => st.items.find((i) => i.id === id));
  const removeItem = useAppStore((st) => st.removeItem);
  const toggleFavorite = useAppStore((st) => st.toggleItemFavorite);
  const setItemStatus = useAppStore((st) => st.setItemStatus);

  if (!item) {
    return (
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.colors.textMuted }}>{t('detail.notFound')}</Text>
      </View>
    );
  }

  const confirmDelete = () =>
    showDialog(t('detail.deleteTitle'), t('detail.deleteMsg', { name: item.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          removeItem(item.id);
          navigation.goBack();
        },
      },
    ]);

  const row = (label: string, value?: string) =>
    value ? (
      <View style={s.infoRow}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    ) : null;

  const mainCatLabel = MAIN_CATEGORIES.find((c) => c.key === item.mainCategory)?.label ?? item.mainCategory;
  const currentStatus: ItemStatus = item.status ?? 'aktywna';

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <ItemImage
          photoUri={item.photoUri}
          mainCategory={item.mainCategory}
          subcategory={item.subcategory}
          size={200}
          borderRadius={theme.radius.lg}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Text style={s.title}>{item.name}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={{ marginLeft: 8 }} accessibilityRole="button">
            <MaterialCommunityIcons
              name={item.favorite ? 'heart' : 'heart-outline'}
              size={26}
              color={item.favorite ? theme.colors.primary : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
      </View>

      {/* status: archiwum / zwrócona / sprzedana / wyrzucona */}
      <Card>
        <Text style={s.cardTitle}>{t('detail.statusCard')}</Text>
        <Text style={s.statusHint}>{t('detail.statusHint')}</Text>
        <ChipRow>
          {STATUSES.map((st) => (
            <Chip
              key={st.key}
              label={t(`status.${st.key}` as any)}
              icon={st.icon}
              selected={currentStatus === st.key}
              onPress={() => setItemStatus(item.id, st.key === 'aktywna' ? undefined : st.key)}
            />
          ))}
        </ChipRow>
      </Card>

      <Card>
        {row(t('detail.categoryRow'), `${categoryLabel(lang, item.mainCategory, mainCatLabel)} · ${subcatLabel(lang, item.subcategory)}`)}
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>{t('detail.colorsRow')}</Text>
          <ColorDots colors={item.colors} />
        </View>
        {row(t('detail.patternRow'), patternLabel(lang, item.pattern))}
        {row(t('detail.sizeRow'), item.size)}
        {row(t('detail.brandRow'), item.brand)}
        {row(t('detail.warmthRow'), `${item.warmth}/5 · ${warmthLabel(lang, item.warmth)}`)}
        {item.waterproof ? row(t('detail.waterproofRow'), t('detail.yes')) : null}
        {row(t('detail.priceRow'), item.price ? `${item.price.toFixed(2)} zł` : undefined)}
        {row(t('detail.storeRow'), item.store)}
        {row(t('detail.dateRow'), item.purchaseDate)}
      </Card>

      {item.styles.length > 0 && (
        <Card>
          <Text style={s.cardTitle}>{t('detail.stylesCard')}</Text>
          <ChipRow>
            {item.styles.map((st) => (
              <Chip key={st} label={styleLabel(lang, st)} />
            ))}
          </ChipRow>
        </Card>
      )}
      {item.occasions.length > 0 && (
        <Card>
          <Text style={s.cardTitle}>{t('detail.occasionsCard')}</Text>
          <ChipRow>
            {item.occasions.map((o) => {
              const pl = OCCASIONS.find((x) => x.key === o)?.label ?? o;
              return <Chip key={o} label={occasionLabel(lang, o, pl)} />;
            })}
          </ChipRow>
        </Card>
      )}

      <PrimaryButton title={t('common.edit')} icon="pencil" onPress={() => navigation.navigate('ItemForm', { id: item.id })} style={{ marginBottom: 10 }} />
      <PrimaryButton title={t('detail.deleteBtn')} icon="trash-can-outline" variant="danger" onPress={confirmDelete} />
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    title: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
    desc: { color: theme.colors.textMuted, marginTop: 4, textAlign: 'center' },
    cardTitle: { fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
    statusHint: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 8 },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    infoLabel: { color: theme.colors.textMuted, fontSize: 14 },
    infoValue: { color: theme.colors.text, fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  });
