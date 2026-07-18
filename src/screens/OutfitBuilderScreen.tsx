import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chip, ChipRow, EmptyState, Field, ItemThumb, PrimaryButton, Section } from '../components/ui';
import { MAIN_CATEGORIES, OCCASIONS } from '../data/constants';
import { useI18n } from '../i18n';
import { categoryLabel, occasionLabel } from '../i18n/labels';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { showDialog } from '../utils/dialog';
import { isItemActive, MainCategory, Occasion } from '../types';

export default function OutfitBuilderScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const allItems = useAppStore((st) => st.items);
  const addOutfit = useAppStore((st) => st.addOutfit);
  const items = useMemo(() => allItems.filter(isItemActive), [allItems]);

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
      showDialog(t('builder.tooFew'), t('builder.tooFewMsg'));
      return;
    }
    addOutfit({
      name: name.trim() || `${t('builder.myOutfit')} · ${new Date().toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB')}`,
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
        <EmptyState icon="wardrobe-outline" text={t('builder.emptyWardrobe')} />
        <View style={{ paddingHorizontal: 24 }}>
          <PrimaryButton
            title={t('builder.goToWardrobe')}
            icon="plus"
            onPress={() => navigation.navigate('Szafa', { screen: 'ItemForm', params: {} })}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <Field label={t('builder.name')} value={name} onChangeText={setName} placeholder={t('builder.namePlaceholder')} />
      <Field label={t('builder.note')} value={note} onChangeText={setNote} placeholder={t('builder.notePlaceholder')} />

      <Section title={t('builder.occasionOpt')}>
        <ChipRow>
          {OCCASIONS.map((o) => (
            <Chip
              key={o.key}
              label={occasionLabel(lang, o.key, o.label)}
              icon={o.icon}
              selected={occasion === o.key}
              onPress={() => setOccasion(occasion === o.key ? undefined : o.key)}
            />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('builder.pickItems', { count: selected.length })}>
        <ChipRow>
          <Chip label={t('wardrobe.all')} selected={category === 'wszystko'} onPress={() => setCategory('wszystko')} />
          {MAIN_CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={categoryLabel(lang, c.key, c.label)}
              icon={c.icon}
              selected={category === c.key}
              onPress={() => setCategory(c.key)}
            />
          ))}
        </ChipRow>
        <View style={s.grid}>
          {filtered.map((item) => {
            const isSel = selected.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[s.gridItem, isSel && s.gridItemSelected]}
                onPress={() => toggleItem(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSel }}
              >
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
        {filtered.length === 0 && <Text style={{ color: theme.colors.textMuted }}>{t('builder.noItemsInCategory')}</Text>}
      </Section>

      <PrimaryButton title={t('builder.save')} icon="content-save-outline" onPress={save} />
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
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
    gridItemSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.cardAlt },
    check: { position: 'absolute', top: 2, right: 2, backgroundColor: theme.colors.card, borderRadius: 11 },
    gridLabel: { fontSize: 11, color: theme.colors.text, marginTop: 3, maxWidth: 84 },
  });
