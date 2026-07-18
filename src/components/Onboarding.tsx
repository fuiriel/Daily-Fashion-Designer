import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { PrimaryButton } from './ui';

interface Slide {
  icon: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'hanger',
    title: 'Twój wirtualny stylista',
    text: 'Daily Fashion Designer układa gotowe stylizacje z ubrań, które naprawdę masz w szafie. Dopasuje je do pogody, okazji i Twojego stylu.',
  },
  {
    icon: 'wardrobe-outline',
    title: 'Zbuduj wirtualną szafę',
    text: 'Dodawaj ubrania, buty i akcesoria ze zdjęciem, kolorem i opisem. Oznaczaj ulubione — stylista da im pierwszeństwo.',
  },
  {
    icon: 'auto-fix',
    title: 'Poproś o kompozycję',
    text: 'Wybierz okazję (praca, randka, wesele…) i porę dnia. Stylista sprawdzi pogodę i zaproponuje kilka kompletnych zestawów, a Ty zapiszesz ulubione.',
  },
  {
    icon: 'calendar-heart',
    title: 'Planuj i pakuj',
    text: 'Zaplanuj stylizacje w kalendarzu, a przed wyjazdem pozwól aplikacji ułożyć listę pakowania na tamtejszą pogodę. Wszystko zapisuje się na Twoim urządzeniu.',
  },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { theme } = useTheme();
  const s = useThemedStyles(makeStyles);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const width = Dimensions.get('window').width;

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={onDone}>
      <View style={s.container}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={onDone} hitSlop={10}>
            <Text style={s.skip}>Pomiń</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.body, { maxWidth: Math.min(width, 520) }]}>
          <View style={s.iconCircle}>
            <MaterialCommunityIcons name={slide.icon as any} size={72} color={theme.colors.primary} />
          </View>
          <Text style={s.title}>{slide.title}</Text>
          <Text style={s.text}>{slide.text}</Text>
        </View>

        <View style={s.footer}>
          <View style={s.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[s.dot, i === index && s.dotActive]} />
            ))}
          </View>
          <PrimaryButton
            title={isLast ? 'Zaczynamy!' : 'Dalej'}
            icon={isLast ? 'check' : 'arrow-right'}
            onPress={() => (isLast ? onDone() : setIndex(index + 1))}
          />
          {!isLast && (
            <TouchableOpacity onPress={onDone} style={{ marginTop: 12 }}>
              <Text style={s.skipBottom}>Pomiń wprowadzenie</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topBar: { width: '100%', alignItems: 'flex-end' },
  skip: { color: theme.colors.textMuted, fontSize: 15, fontWeight: '600' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text, textAlign: 'center', marginBottom: 14 },
  text: { fontSize: 16, lineHeight: 23, color: theme.colors.textMuted, textAlign: 'center' },
  footer: { width: '100%', maxWidth: 520, alignItems: 'stretch' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: theme.colors.primary, width: 22 },
  skipBottom: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' },
});
