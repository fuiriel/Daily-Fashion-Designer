import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import DatePickerField from '../components/DatePickerField';
import { Chip, ChipRow, Field, PrimaryButton, Section } from '../components/ui';
import {
  COLOR_PALETTE,
  MAIN_CATEGORIES,
  OCCASIONS,
  PATTERNS,
  SEASONS,
  STYLES,
  SUBCATEGORIES,
} from '../data/constants';
import { useI18n } from '../i18n';
import {
  categoryLabel,
  colorLabel,
  occasionLabel,
  patternLabel,
  seasonLabel,
  styleLabel,
  subcatLabel,
  warmthLabel,
} from '../i18n/labels';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { showDialog } from '../utils/dialog';
import { analyzePhotoColors, suggestItemDescription, suggestItemName } from '../utils/photoAnalysis';
import { MainCategory, Occasion, Pattern, Season, StyleTag, WardrobeItem } from '../types';

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export default function ItemFormScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const editId: string | undefined = route.params?.id;
  const existing = useAppStore((st) => st.items.find((i) => i.id === editId));
  const addItem = useAppStore((st) => st.addItem);
  const updateItem = useAppStore((st) => st.updateItem);
  const catalogs = useAppStore((st) => st.catalogs);

  // tytuł widoku: „Nowy przedmiot" / „Edycja przedmiotu"
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: editId ? t('title.itemEdit') : t('title.itemNew') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, editId, lang]);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [mainCategory, setMainCategory] = useState<MainCategory>(existing?.mainCategory ?? 'ubrania');
  const [subcategory, setSubcategory] = useState(existing?.subcategory ?? '');
  const [photoUri, setPhotoUri] = useState(existing?.photoUri);
  const [colors, setColors] = useState<string[]>(existing?.colors ?? []);
  const [pattern, setPattern] = useState<Pattern>(existing?.pattern ?? 'gładki');
  const [size, setSize] = useState(existing?.size ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [price, setPrice] = useState(existing?.price ? String(existing.price) : '');
  const [store, setStore] = useState(existing?.store ?? '');
  const [purchaseDate, setPurchaseDate] = useState(existing?.purchaseDate ?? '');
  const [styles_, setStyles] = useState<StyleTag[]>(existing?.styles ?? []);
  const [occasions, setOccasions] = useState<Occasion[]>(existing?.occasions ?? []);
  const [seasons, setSeasons] = useState<Season[]>(existing?.seasons ?? []);
  const [warmth, setWarmth] = useState<WardrobeItem['warmth']>(existing?.warmth ?? 2);
  const [waterproof, setWaterproof] = useState(existing?.waterproof ?? false);
  const [favorite, setFavorite] = useState(existing?.favorite ?? false);
  const [catalogIds, setCatalogIds] = useState<string[]>(existing?.catalogIds ?? []);
  const [detectedColors, setDetectedColors] = useState<string[]>([]);

  // sugestia nazwy/opisu na podstawie wykrytych kolorów i wybranego rodzaju
  const suggestedName = useMemo(
    () => suggestItemName(lang, detectedColors.length ? detectedColors : colors, subcategory),
    [lang, detectedColors, colors, subcategory]
  );

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showDialog(t('item.noPermTitle'), t('item.noPermMsg'));
      return;
    }
    const options: ImagePicker.ImagePickerOptions = { quality: 0.6, allowsEditing: true, base64: true };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      // rozpoznaj dominujące kolory i podpowiedz atrybuty
      const found = await analyzePhotoColors(asset.uri, asset.base64 ?? undefined);
      if (found.length) {
        setDetectedColors(found);
        if (colors.length === 0) setColors(found);
      }
    }
  };

  const applySuggestion = () => {
    if (suggestedName) setName(suggestedName);
    const desc = suggestItemDescription(lang, detectedColors.length ? detectedColors : colors);
    if (desc && !description) setDescription(desc);
  };

  const save = () => {
    if (!name.trim()) {
      showDialog(t('item.needName'), t('item.needNameMsg'));
      return;
    }
    if (!subcategory) {
      showDialog(t('item.needSub'), t('item.needSubMsg'));
      return;
    }
    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      mainCategory,
      subcategory,
      photoUri,
      colors,
      pattern,
      size: size.trim() || undefined,
      brand: brand.trim() || undefined,
      price: price ? Number(price.replace(',', '.')) : undefined,
      store: store.trim() || undefined,
      purchaseDate: purchaseDate.trim() || undefined,
      favorite,
      styles: styles_,
      occasions,
      seasons,
      warmth,
      waterproof,
      catalogIds,
      status: existing?.status,
    };
    if (editId) updateItem(editId, data);
    else addItem(data);
    navigation.goBack();
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <Section title={t('item.photo')}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={s.photo} />
          ) : (
            <View style={[s.photo, s.photoPlaceholder]}>
              <MaterialCommunityIcons name="camera-outline" size={32} color={theme.colors.textMuted} />
            </View>
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <PrimaryButton title={t('item.takePhoto')} icon="camera" onPress={() => pickImage(true)} style={{ marginBottom: 8 }} />
            <PrimaryButton title={t('item.fromGallery')} icon="image" variant="outline" onPress={() => pickImage(false)} />
          </View>
        </View>
        {detectedColors.length > 0 && (
          <View style={s.suggestBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
              <MaterialCommunityIcons name="auto-fix" size={16} color={theme.colors.accent} style={{ marginRight: 6 }} />
              <Text style={s.suggestText}>
                {t('item.suggested')} {detectedColors.map((c) => colorLabel(lang, c)).join(', ')}
                {suggestedName ? ` → „${suggestedName}"` : ''}
              </Text>
            </View>
            {suggestedName ? (
              <TouchableOpacity onPress={applySuggestion} accessibilityRole="button">
                <Text style={s.suggestApply}>{t('item.applySuggestion')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </Section>

      <Field label={t('item.name')} value={name} onChangeText={setName} placeholder={t('item.namePlaceholder')} />
      <Field
        label={t('item.description')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('item.descriptionPlaceholder')}
        multiline
      />

      <Section title={t('item.category')}>
        <ChipRow>
          {MAIN_CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={categoryLabel(lang, c.key, c.label)}
              icon={c.icon}
              selected={mainCategory === c.key}
              onPress={() => {
                setMainCategory(c.key);
                setSubcategory('');
              }}
            />
          ))}
        </ChipRow>
        <ChipRow>
          {SUBCATEGORIES[mainCategory].map((sc) => (
            <Chip
              key={sc.name}
              label={subcatLabel(lang, sc.name)}
              selected={subcategory === sc.name}
              onPress={() => setSubcategory(sc.name)}
            />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('item.colors')}>
        <ChipRow>
          {COLOR_PALETTE.map((c) => (
            <TouchableOpacity
              key={c.name}
              onPress={() => setColors(toggle(colors, c.name))}
              accessibilityRole="button"
              accessibilityLabel={colorLabel(lang, c.name)}
              style={[s.colorSwatch, { backgroundColor: c.hex }, colors.includes(c.name) && s.colorSwatchSelected]}
            >
              {colors.includes(c.name) && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={['biały', 'żółty', 'srebrny', 'beżowy'].includes(c.name) ? '#333' : '#fff'}
                />
              )}
            </TouchableOpacity>
          ))}
        </ChipRow>
        <Text style={s.hint}>
          {colors.length ? colors.map((c) => colorLabel(lang, c)).join(', ') : t('item.colorsHint')}
        </Text>
      </Section>

      <Section title={t('item.pattern')}>
        <ChipRow>
          {PATTERNS.map((p) => (
            <Chip key={p} label={patternLabel(lang, p)} selected={pattern === p} onPress={() => setPattern(p)} />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('item.warmth')}>
        <ChipRow>
          {([1, 2, 3, 4, 5] as const).map((w) => (
            <Chip key={w} label={`${w} · ${warmthLabel(lang, w)}`} selected={warmth === w} onPress={() => setWarmth(w)} />
          ))}
        </ChipRow>
        <View style={s.switchRow}>
          <Text style={{ color: theme.colors.text }}>{t('item.waterproof')}</Text>
          <Switch value={waterproof} onValueChange={setWaterproof} trackColor={{ true: theme.colors.primary }} />
        </View>
      </Section>

      <Section title={t('item.styles')}>
        <ChipRow>
          {STYLES.map((st) => (
            <Chip key={st} label={styleLabel(lang, st)} selected={styles_.includes(st)} onPress={() => setStyles(toggle(styles_, st))} />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('item.occasions')}>
        <ChipRow>
          {OCCASIONS.map((o) => (
            <Chip
              key={o.key}
              label={occasionLabel(lang, o.key, o.label)}
              icon={o.icon}
              selected={occasions.includes(o.key)}
              onPress={() => setOccasions(toggle(occasions, o.key))}
            />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('item.seasons')}>
        <ChipRow>
          {SEASONS.map((se) => (
            <Chip key={se} label={seasonLabel(lang, se)} selected={seasons.includes(se)} onPress={() => setSeasons(toggle(seasons, se))} />
          ))}
        </ChipRow>
      </Section>

      {catalogs.length > 0 && (
        <Section title={t('item.catalogsSection')}>
          <ChipRow>
            {catalogs.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                icon="folder-outline"
                selected={catalogIds.includes(c.id)}
                onPress={() => setCatalogIds(toggle(catalogIds, c.id))}
              />
            ))}
          </ChipRow>
        </Section>
      )}

      <Field label={t('item.sizeLabel')} value={size} onChangeText={setSize} placeholder={t('item.sizePlaceholder')} />
      <Field label={t('item.brand')} value={brand} onChangeText={setBrand} placeholder={t('item.brandPlaceholder')} />
      <Field label={t('item.price')} value={price} onChangeText={setPrice} placeholder={t('item.pricePlaceholder')} keyboardType="numeric" />
      <Field label={t('item.store')} value={store} onChangeText={setStore} placeholder={t('item.storePlaceholder')} />
      <DatePickerField label={t('item.purchaseDate')} value={purchaseDate} onChange={setPurchaseDate} placeholder={t('item.purchaseDatePick')} />

      <View style={s.switchRow}>
        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{t('item.favorite')}</Text>
        <Switch value={favorite} onValueChange={setFavorite} trackColor={{ true: theme.colors.primary }} />
      </View>

      <PrimaryButton title={editId ? t('item.saveChanges') : t('item.addToWardrobe')} icon="check" onPress={save} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    photo: { width: 110, height: 110, borderRadius: theme.radius.md },
    photoPlaceholder: {
      backgroundColor: theme.colors.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.cardAlt,
      borderRadius: theme.radius.sm,
      padding: 10,
      marginTop: 10,
    },
    suggestText: { color: theme.colors.text, fontSize: 13, flexShrink: 1 },
    suggestApply: { color: theme.colors.primary, fontWeight: '700', fontSize: 13, marginLeft: 10 },
    colorSwatch: {
      width: 34,
      height: 34,
      borderRadius: 17,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorSwatchSelected: { borderWidth: 2.5, borderColor: theme.colors.primaryDark },
    hint: { color: theme.colors.textMuted, fontSize: 12 },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
  });
