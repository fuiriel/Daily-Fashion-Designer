import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GapSuggestions from '../components/GapSuggestions';
import { Card, Chip, ChipRow, ItemThumb, PrimaryButton, Section } from '../components/ui';
import { OCCASIONS, STYLES, TIMES_OF_DAY, slotOf } from '../data/constants';
import { useI18n } from '../i18n';
import { bottomPrefLabel, occasionLabel, slotLabel, styleLabel, timeLabel } from '../i18n/labels';
import { analyzeGaps } from '../logic/gaps';
import { suggestOutfits } from '../logic/stylist';
import { fetchCurrentWeather, geocodeCity, manualWeather } from '../services/weather';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { useContentStyle } from '../theme/responsive';
import { showDialog } from '../utils/dialog';
import {
  BottomPreference,
  isItemActive,
  Occasion,
  OutfitSuggestion,
  StyleTag,
  TimeOfDay,
  WeatherInfo,
} from '../types';

function defaultTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h < 10) return 'rano';
  if (h < 17) return 'dzień';
  if (h < 22) return 'wieczór';
  return 'noc';
}

export default function StylistScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const contentStyle = useContentStyle();
  const allItems = useAppStore((st) => st.items);
  const stores = useAppStore((st) => st.stores);
  const prefs = useAppStore((st) => st.prefs);
  const setPrefs = useAppStore((st) => st.setPrefs);
  const addOutfit = useAppStore((st) => st.addOutfit);

  // stylizacje układamy tylko z aktywnych rzeczy
  const items = useMemo(() => allItems.filter(isItemActive), [allItems]);

  const [occasion, setOccasion] = useState<Occasion>('codzienne');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(defaultTimeOfDay());
  const [bottomPref, setBottomPref] = useState<BottomPreference>('dowolnie');
  const [styles_, setStyles] = useState<StyleTag[]>(prefs.favoriteStyles);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [city, setCity] = useState(prefs.city ?? '');
  const [manualTemp, setManualTemp] = useState('18');
  const [manualRain, setManualRain] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[] | null>(null);

  // auto-przewinięcie do sekcji wyników po wygenerowaniu propozycji
  const scrollRef = useRef<ScrollView>(null);
  const resultsY = useRef(0);
  const pendingScroll = useRef(false);
  useEffect(() => {
    if (suggestions !== null && pendingScroll.current) {
      pendingScroll.current = false;
      setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(resultsY.current - 8, 0), animated: true }), 80);
    }
  }, [suggestions]);

  const loadWeatherByLocation = async () => {
    setLoadingWeather(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) throw new Error(t('stylist.locationDenied'));
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const w = await fetchCurrentWeather(loc.coords.latitude, loc.coords.longitude);
      setWeather(w);
    } catch (e: any) {
      showDialog(t('stylist.noWeatherTitle'), e?.message ?? t('stylist.weatherError'));
    } finally {
      setLoadingWeather(false);
    }
  };

  const loadWeatherByCity = async () => {
    if (!city.trim()) return;
    setLoadingWeather(true);
    try {
      const geo = await geocodeCity(city.trim());
      if (!geo) throw new Error(t('stylist.cityNotFound'));
      const w = await fetchCurrentWeather(geo.latitude, geo.longitude, `${geo.name}, ${geo.country}`);
      setWeather(w);
      setPrefs({ city: city.trim() });
    } catch (e: any) {
      showDialog(t('stylist.noWeatherTitle'), e?.message ?? t('stylist.weatherError'));
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (prefs.city) loadWeatherByCity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveWeather = useManual ? manualWeather(Number(manualTemp) || 15, manualRain) : weather;

  const generate = () => {
    // pusta szafa: nie ma z czego układać — pokaż sugestie zakupów (sekcja niżej)
    if (items.length === 0) {
      pendingScroll.current = true;
      setSuggestions([]);
      return;
    }
    if (!effectiveWeather) {
      showDialog(t('stylist.noWeatherTitle'), t('stylist.noWeatherMsg'));
      return;
    }
    const res = suggestOutfits(items, {
      occasion,
      timeOfDay,
      bottomPreference: bottomPref,
      styles: styles_,
      weather: effectiveWeather,
      lang,
    });
    pendingScroll.current = true;
    setSuggestions(res);
  };

  // sugestie zakupów, gdy nie da się złożyć zestawu
  const gaps = useMemo(() => analyzeGaps(allItems, stores), [allItems, stores]);

  const saveSuggestion = (sug: OutfitSuggestion) => {
    const plLabel = OCCASIONS.find((o) => o.key === occasion)?.label ?? occasion;
    addOutfit({
      name: `${occasionLabel(lang, occasion, plLabel)} · ${new Date().toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB')}`,
      itemIds: sug.items.map((i) => i.id),
      occasion,
      favorite: false,
      source: 'stylista',
    });
    showDialog(t('stylist.saved'), t('stylist.savedMsg'));
  };

  return (
    <ScrollView ref={scrollRef} style={s.container} contentContainerStyle={[{ padding: 16, paddingBottom: 40 }, contentStyle]}>
      <Card>
        <Text style={s.cardTitle}>{t('stylist.weather')}</Text>
        {effectiveWeather ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons
              name={effectiveWeather.isRain ? 'weather-rainy' : effectiveWeather.isSnow ? 'weather-snowy' : 'weather-partly-cloudy'}
              size={34}
              color={theme.colors.accent}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>
                {effectiveWeather.tempC}°C · {effectiveWeather.description}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                {t('stylist.feelsLike')} {effectiveWeather.feelsLikeC}°C · {t('stylist.precip')}{' '}
                {effectiveWeather.precipitationProb}%{effectiveWeather.city ? ` · ${effectiveWeather.city}` : ''}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: theme.colors.textMuted, marginBottom: 8 }}>{t('stylist.weatherHint')}</Text>
        )}
        {!useManual && (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <TextInput
                style={[s.input, { flex: 1, marginRight: 8 }]}
                placeholder={t('stylist.cityPlaceholder')}
                placeholderTextColor={theme.colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
              <PrimaryButton title={t('stylist.check')} onPress={loadWeatherByCity} />
            </View>
            <PrimaryButton title={t('stylist.useLocation')} icon="crosshairs-gps" variant="outline" onPress={loadWeatherByLocation} />
          </>
        )}
        {loadingWeather && <ActivityIndicator style={{ marginTop: 8 }} color={theme.colors.primary} />}
        <View style={s.switchRow}>
          <Text style={{ color: theme.colors.text }}>{t('stylist.manualWeather')}</Text>
          <Switch value={useManual} onValueChange={setUseManual} trackColor={{ true: theme.colors.primary }} />
        </View>
        {useManual && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TextInput style={[s.input, { width: 80, marginRight: 8 }]} keyboardType="numeric" value={manualTemp} onChangeText={setManualTemp} />
            <Text style={{ color: theme.colors.text, marginRight: 16 }}>°C</Text>
            <Text style={{ color: theme.colors.text, marginRight: 8 }}>{t('stylist.rain')}</Text>
            <Switch value={manualRain} onValueChange={setManualRain} trackColor={{ true: theme.colors.primary }} />
          </View>
        )}
      </Card>

      <Section title={t('stylist.occasion')}>
        <ChipRow>
          {OCCASIONS.map((o) => (
            <Chip
              key={o.key}
              label={occasionLabel(lang, o.key, o.label)}
              icon={o.icon}
              selected={occasion === o.key}
              onPress={() => setOccasion(o.key)}
            />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('stylist.timeOfDay')}>
        <ChipRow>
          {TIMES_OF_DAY.map((tm) => (
            <Chip
              key={tm.key}
              label={timeLabel(lang, tm.key, tm.label)}
              icon={tm.icon}
              selected={timeOfDay === tm.key}
              onPress={() => setTimeOfDay(tm.key)}
            />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('stylist.dressOrPants')}>
        <ChipRow>
          {(['dowolnie', 'sukienka', 'spodnie', 'spódnica'] as BottomPreference[]).map((b) => (
            <Chip key={b} label={bottomPrefLabel(lang, b)} selected={bottomPref === b} onPress={() => setBottomPref(b)} />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('stylist.preferredStyle')}>
        <ChipRow>
          {STYLES.map((st) => (
            <Chip
              key={st}
              label={styleLabel(lang, st)}
              selected={styles_.includes(st)}
              onPress={() => setStyles((prev) => (prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]))}
            />
          ))}
        </ChipRow>
      </Section>

      <PrimaryButton title={t('stylist.generate')} icon="auto-fix" onPress={generate} />

      {suggestions !== null && (
        <View style={{ marginTop: 20 }} onLayout={(e) => (resultsY.current = e.nativeEvent.layout.y)}>
          <Text style={s.resultsTitle} accessibilityRole="header">
            {t('stylist.results')}
          </Text>
          {suggestions.length === 0 && (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <MaterialCommunityIcons name="cart-heart" size={22} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[s.cardTitle, { marginBottom: 0, flex: 1 }]}>{t('stylist.buyTitle')}</Text>
              </View>
              <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginBottom: 8 }}>
                {items.length === 0 ? t('stylist.buyEmptyWardrobe') : t('stylist.buyNoMatch')}
              </Text>
              {gaps.length > 0 ? (
                <GapSuggestions gaps={gaps} limit={6} />
              ) : (
                <Text style={{ color: theme.colors.accent, fontSize: 14, marginTop: 4 }}>{t('stylist.buyAllGood')}</Text>
              )}
              <PrimaryButton
                title={t('stylist.addItem')}
                icon="plus"
                variant="outline"
                onPress={() => navigation.navigate('Szafa', { screen: 'ItemForm', params: {} })}
                style={{ marginTop: 14 }}
              />
            </Card>
          )}
          <View style={s.cardsWrap}>
            {suggestions.map((sug, idx) => (
              <View key={idx} style={s.propCard}>
                <View style={s.propHeader}>
                  <View style={s.propBadge}>
                    <Text style={s.propBadgeText}>{idx + 1}</Text>
                  </View>
                  <Text style={s.propTitle} accessibilityRole="header">
                    {t('stylist.proposal')} {idx + 1}
                  </Text>
                  <Text style={s.propCount}>
                    {sug.items.length} {t('stylist.parts')}
                  </Text>
                </View>

                {/* części stylizacji z etykietą slotu (Góra / Dół / Buty...) */}
                <View style={s.itemsGrid}>
                  {sug.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={s.itemTile}
                      onPress={() => navigation.navigate('Szafa', { screen: 'ItemDetail', params: { id: item.id } })}
                      accessibilityRole="imagebutton"
                      accessibilityLabel={item.name}
                    >
                      <View style={s.slotBadge}>
                        <Text style={s.slotBadgeText}>{slotLabel(lang, slotOf(item.mainCategory, item.subcategory))}</Text>
                      </View>
                      <ItemThumb item={item} size={84} />
                      <Text numberOfLines={2} style={s.itemTileLabel}>
                        {item.favorite ? '❤️ ' : ''}
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {sug.explanation.length > 0 && (
                  <View style={s.explanationBox}>
                    {sug.explanation.map((e, i) => (
                      <Text key={i} style={s.explanation}>
                        • {e}
                      </Text>
                    ))}
                  </View>
                )}
                {sug.missing.length > 0 && (
                  <Text style={s.missing}>
                    {t('stylist.missing')} {sug.missing.join(', ')} — {t('stylist.missingLink')}
                  </Text>
                )}
                <PrimaryButton
                  title={t('stylist.saveOutfit')}
                  icon="content-save-outline"
                  variant="outline"
                  onPress={() => saveSuggestion(sug)}
                  style={{ marginTop: 12 }}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    cardTitle: { fontWeight: '700', color: theme.colors.text, marginBottom: 8, fontSize: 15 },
    resultsTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
    input: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 15,
      color: theme.colors.text,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    explanationBox: {
      backgroundColor: theme.colors.cardAlt,
      borderRadius: theme.radius.sm,
      padding: 10,
      marginTop: 4,
    },
    explanation: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 3, lineHeight: 18 },
    missing: { color: theme.colors.danger, fontSize: 13, marginTop: 8 },
    // karty propozycji
    cardsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
    propCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      marginHorizontal: 6,
      flexGrow: 1,
      flexBasis: 340,
    },
    propHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    propBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    propBadgeText: { color: theme.colors.onPrimary, fontWeight: '800', fontSize: 14 },
    propTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: theme.colors.text },
    propCount: { fontSize: 12, color: theme.colors.textMuted },
    itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
    itemTile: {
      width: 104,
      alignItems: 'center',
      marginHorizontal: 5,
      marginBottom: 10,
      backgroundColor: theme.colors.cardAlt,
      borderRadius: theme.radius.sm,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    slotBadge: {
      backgroundColor: theme.colors.card,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginBottom: 6,
    },
    slotBadgeText: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase' },
    itemTileLabel: { fontSize: 11, color: theme.colors.text, marginTop: 4, textAlign: 'center' },
  });
