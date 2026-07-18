import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showDialog } from '../utils/dialog';
import { Card, Chip, ChipRow, ColorDots, PrimaryButton } from '../components/ui';
import { WARMTH_LABELS } from '../data/constants';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';

export default function ItemDetailScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const id: string = route.params.id;
  const item = useAppStore((st) => st.items.find((i) => i.id === id));
  const removeItem = useAppStore((st) => st.removeItem);
  const toggleFavorite = useAppStore((st) => st.toggleItemFavorite);

  if (!item) {
    return (
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.colors.textMuted }}>Nie znaleziono rzeczy.</Text>
      </View>
    );
  }

  const confirmDelete = () =>
    showDialog('Usunąć?', `„${item.name}" zniknie z szafy i zapisanych kompozycji.`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
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

  return (
    <ScrollView style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={s.photo} />
        ) : (
          <View style={[s.photo, s.photoPlaceholder]}>
            <MaterialCommunityIcons name="hanger" size={64} color={theme.colors.textMuted} />
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Text style={s.title}>{item.name}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={{ marginLeft: 8 }}>
            <MaterialCommunityIcons
              name={item.favorite ? 'heart' : 'heart-outline'}
              size={26}
              color={item.favorite ? theme.colors.primary : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
      </View>

      <Card>
        {row('Kategoria', `${item.mainCategory} · ${item.subcategory}`)}
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Kolory</Text>
          <ColorDots colors={item.colors} />
        </View>
        {row('Wzór', item.pattern)}
        {row('Rozmiar', item.size)}
        {row('Marka', item.brand)}
        {row('Ciepło', `${item.warmth}/5 · ${WARMTH_LABELS[item.warmth]}`)}
        {item.waterproof ? row('Nieprzemakalne', 'tak') : null}
        {row('Cena', item.price ? `${item.price.toFixed(2)} zł` : undefined)}
        {row('Sklep', item.store)}
        {row('Data zakupu', item.purchaseDate)}
      </Card>

      {item.styles.length > 0 && (
        <Card>
          <Text style={s.cardTitle}>Style</Text>
          <ChipRow>
            {item.styles.map((st) => (
              <Chip key={st} label={st} />
            ))}
          </ChipRow>
        </Card>
      )}
      {item.occasions.length > 0 && (
        <Card>
          <Text style={s.cardTitle}>Okazje</Text>
          <ChipRow>
            {item.occasions.map((o) => (
              <Chip key={o} label={o} />
            ))}
          </ChipRow>
        </Card>
      )}

      <PrimaryButton title="Edytuj" icon="pencil" onPress={() => navigation.navigate('ItemForm', { id: item.id })} style={{ marginBottom: 10 }} />
      <PrimaryButton title="Usuń z szafy" icon="trash-can-outline" variant="danger" onPress={confirmDelete} />
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  photo: { width: 200, height: 200, borderRadius: theme.radius.lg },
  photoPlaceholder: {
    backgroundColor: theme.colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  desc: { color: theme.colors.textMuted, marginTop: 4, textAlign: 'center' },
  cardTitle: { fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: { color: theme.colors.textMuted, fontSize: 14 },
  infoValue: { color: theme.colors.text, fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
});
