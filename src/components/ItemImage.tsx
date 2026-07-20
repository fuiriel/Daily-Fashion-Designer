import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { garmentDataUri, garmentIcon } from '../graphics/garmentPlaceholders';
import { useTheme } from '../theme/ThemeContext';
import { MainCategory } from '../types';

// Zastępcza grafika rodzaju rzeczy (gdy brak zdjęcia lub nie udało się go wczytać).
// Web: ilustracja SVG jako <img>. Telefon: glif MaterialCommunityIcons — tam
// Image nie renderuje SVG bez dodatkowej biblioteki.
export function GarmentPlaceholder({
  mainCategory,
  subcategory,
  size,
  borderRadius,
}: {
  mainCategory: MainCategory;
  subcategory?: string;
  size: number;
  borderRadius: number;
}) {
  const { theme } = useTheme();
  const color = theme.colors.textMuted;
  const bg = theme.colors.chipBg;
  const box = {
    width: size,
    height: size,
    borderRadius,
    backgroundColor: bg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  };
  if (Platform.OS === 'web') {
    const uri = garmentDataUri(mainCategory, subcategory, color, bg);
    return (
      <View style={box}>
        <Image source={{ uri }} style={{ width: size * 0.64, height: size * 0.64 }} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={box}>
      <MaterialCommunityIcons name={garmentIcon(mainCategory, subcategory) as any} size={size * 0.5} color={color} />
    </View>
  );
}

// Zdjęcie rzeczy z bezpiecznym zapasem: jeśli `photoUri` jest puste albo obraz
// nie chce się załadować (onError), pokazujemy sylwetkę dopasowaną do rodzaju.
export function ItemImage({
  photoUri,
  mainCategory,
  subcategory,
  size,
  borderRadius,
}: {
  photoUri?: string;
  mainCategory: MainCategory;
  subcategory?: string;
  size: number;
  borderRadius: number;
}) {
  const [failed, setFailed] = useState(false);
  // nowy adres zdjęcia = kolejna próba wczytania
  useEffect(() => setFailed(false), [photoUri]);

  if (photoUri && !failed) {
    return (
      <Image
        source={{ uri: photoUri }}
        style={{ width: size, height: size, borderRadius }}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <GarmentPlaceholder mainCategory={mainCategory} subcategory={subcategory} size={size} borderRadius={borderRadius} />
  );
}
