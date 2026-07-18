import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../i18n';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { PrimaryButton } from './ui';

const SLIDES = [
  { icon: 'hanger', title: 'onboarding.s1.title', text: 'onboarding.s1.text' },
  { icon: 'wardrobe-outline', title: 'onboarding.s2.title', text: 'onboarding.s2.text' },
  { icon: 'auto-fix', title: 'onboarding.s3.title', text: 'onboarding.s3.text' },
  { icon: 'calendar-heart', title: 'onboarding.s4.title', text: 'onboarding.s4.text' },
] as const;

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const width = Dimensions.get('window').width;

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={onDone}>
      <View style={s.container}>
        {/* jeden przycisk pominięcia — w prawym górnym rogu */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={onDone} hitSlop={10} accessibilityRole="button">
            <Text style={s.skip}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.body, { maxWidth: Math.min(width, 520) }]}>
          <View style={s.iconCircle}>
            <MaterialCommunityIcons name={slide.icon as any} size={72} color={theme.colors.primary} />
          </View>
          <Text style={s.title}>{t(slide.title)}</Text>
          <Text style={s.text}>{t(slide.text)}</Text>
        </View>

        <View style={s.footer}>
          <View style={s.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[s.dot, i === index && s.dotActive]} />
            ))}
          </View>
          <PrimaryButton
            title={isLast ? t('onboarding.start') : t('onboarding.next')}
            icon={isLast ? 'check' : 'arrow-right'}
            onPress={() => (isLast ? onDone() : setIndex(index + 1))}
          />
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
  });
