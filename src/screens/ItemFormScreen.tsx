import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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
  WARMTH_LABELS,
} from '../data/constants';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { MainCategory, Occasion, Pattern, Season, StyleTag, WardrobeItem } from '../types';

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export default function ItemFormScreen({ navigation, route }: any) {
  const editId: string | undefined = route.params?.id;
  const existing = useAppStore((s) => s.items.find((i) => i.id === editId));
  const addItem = useAppStore((s) => s.addItem);
  const updateItem = useAppStore((s) => s.updateItem);

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

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Brak uprawnień', 'Nadaj aplikacji dostęp do aparatu/galerii w ustawieniach telefonu.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });
    if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
  };

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Uzupełnij nazwę', 'Każda rzecz musi mieć nazwę.');
      return;
    }
    if (!subcategory) {
      Alert.alert('Wybierz rodzaj', 'Zaznacz np. sukienka, jeansy, sneakersy...');
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
    };
    if (editId) updateItem(editId, data);
    else addItem(data);
    navigation.goBack();
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Section title="Zdjęcie">
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={s.photo} />
          ) : (
            <View style={[s.photo, s.photoPlaceholder]}>
              <MaterialCommunityIcons name="camera-outline" size={32} color={theme.colors.textMuted} />
            </View>
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <PrimaryButton title="Zrób zdjęcie" icon="camera" onPress={() => pickImage(true)} style={{ marginBottom: 8 }} />
            <PrimaryButton title="Z galerii" icon="image" variant="outline" onPress={() => pickImage(false)} />
          </View>
        </View>
      </Section>

      <Field label="Nazwa *" value={name} onChangeText={setName} placeholder="np. Czarna sukienka midi" />
      <Field label="Opis" value={description} onChangeText={setDescription} placeholder="np. ulubiona, na specjalne okazje" multiline />

      <Section title="Kategoria">
        <ChipRow>
          {MAIN_CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
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
            <Chip key={sc.name} label={sc.name} selected={subcategory === sc.name} onPress={() => setSubcategory(sc.name)} />
          ))}
        </ChipRow>
      </Section>

      <Section title="Kolory">
        <ChipRow>
          {COLOR_PALETTE.map((c) => (
            <TouchableOpacity
              key={c.name}
              onPress={() => setColors(toggle(colors, c.name))}
              style={[s.colorSwatch, { backgroundColor: c.hex }, colors.includes(c.name) && s.colorSwatchSelected]}
            >
              {colors.includes(c.name) && (
                <MaterialCommunityIcons name="check" size={16} color={['biały', 'żółty', 'srebrny', 'beżowy'].includes(c.name) ? '#333' : '#fff'} />
              )}
            </TouchableOpacity>
          ))}
        </ChipRow>
        <Text style={s.hint}>{colors.length ? colors.join(', ') : 'Zaznacz przynajmniej jeden kolor'}</Text>
      </Section>

      <Section title="Wzór">
        <ChipRow>
          {PATTERNS.map((p) => (
            <Chip key={p} label={p} selected={pattern === p} onPress={() => setPattern(p)} />
          ))}
        </ChipRow>
      </Section>

      <Section title="Ciepło (na jaką pogodę)">
        <ChipRow>
          {([1, 2, 3, 4, 5] as const).map((w) => (
            <Chip key={w} label={`${w} · ${WARMTH_LABELS[w]}`} selected={warmth === w} onPress={() => setWarmth(w)} />
          ))}
        </ChipRow>
        <View style={s.switchRow}>
          <Text style={{ color: theme.colors.text }}>Nieprzemakalne</Text>
          <Switch value={waterproof} onValueChange={setWaterproof} trackColor={{ true: theme.colors.primary }} />
        </View>
      </Section>

      <Section title="Style">
        <ChipRow>
          {STYLES.map((st) => (
            <Chip key={st} label={st} selected={styles_.includes(st)} onPress={() => setStyles(toggle(styles_, st))} />
          ))}
        </ChipRow>
      </Section>

      <Section title="Okazje (puste = uniwersalne)">
        <ChipRow>
          {OCCASIONS.map((o) => (
            <Chip key={o.key} label={o.label} icon={o.icon} selected={occasions.includes(o.key)} onPress={() => setOccasions(toggle(occasions, o.key))} />
          ))}
        </ChipRow>
      </Section>

      <Section title="Pory roku (puste = całoroczne)">
        <ChipRow>
          {SEASONS.map((se) => (
            <Chip key={se} label={se} selected={seasons.includes(se)} onPress={() => setSeasons(toggle(seasons, se))} />
          ))}
        </ChipRow>
      </Section>

      <Field label="Rozmiar" value={size} onChangeText={setSize} placeholder="np. M, 38, 39" />
      <Field label="Marka" value={brand} onChangeText={setBrand} placeholder="np. Zara" />
      <Field label="Cena (zł)" value={price} onChangeText={setPrice} placeholder="np. 129.99" keyboardType="numeric" />
      <Field label="Gdzie kupione" value={store} onChangeText={setStore} placeholder="np. Zalando" />
      <DatePickerField label="Data zakupu" value={purchaseDate} onChange={setPurchaseDate} placeholder="Wybierz datę zakupu" />

      <View style={s.switchRow}>
        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Ulubione ❤️ (priorytet u stylisty)</Text>
        <Switch value={favorite} onValueChange={setFavorite} trackColor={{ true: theme.colors.primary }} />
      </View>

      <PrimaryButton title={editId ? 'Zapisz zmiany' : 'Dodaj do szafy'} icon="check" onPress={save} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  photo: { width: 110, height: 110, borderRadius: theme.radius.md },
  photoPlaceholder: {
    backgroundColor: theme.colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
