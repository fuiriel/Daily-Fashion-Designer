import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showDialog } from '../utils/dialog';
import GapSuggestions from '../components/GapSuggestions';
import { Card, Chip, ChipRow, ItemThumb, PrimaryButton, Section } from '../components/ui';
import { OCCASIONS, STYLES, TIMES_OF_DAY } from '../data/constants';
import { analyzeGaps } from '../logic/gaps';
import { suggestOutfits } from '../logic/stylist';
import { fetchCurrentWeather, geocodeCity, manualWeather } from '../services/weather';
import { useAppStore } from '../store/useAppStore';
import { Theme } from '../theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { BottomPreference, Occasion, OutfitSuggestion, StyleTag, TimeOfDay, WeatherInfo } from '../types';

function defaultTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h < 10) return 'rano';
  if (h < 17) return 'dzień';
  if (h < 22) return 'wieczór';
  return 'noc';
}

export default function StylistScreen({ navigation }: any) {
  const { theme } = useTheme();
  const s = useThemedStyles(makeStyles);
  const items = useAppStore((st) => st.items);
  const stores = useAppStore((st) => st.stores);
  const prefs = useAppStore((st) => st.prefs);
  const setPrefs = useAppStore((st) => st.setPrefs);
  const addOutfit = useAppStore((st) => st.addOutfit);

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

  const loadWeatherByLocation = async () => {
    setLoadingWeather(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) throw new Error('Brak zgody na lokalizację — wpisz miasto ręcznie.');
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const w = await fetchCurrentWeather(loc.coords.latitude, loc.coords.longitude, 'Twoja lokalizacja');
      setWeather(w);
    } catch (e: any) {
      showDialog('Pogoda', e?.message ?? 'Nie udało się pobrać pogody.');
    } finally {
      setLoadingWeather(false);
    }
  };

  const loadWeatherByCity = async () => {
    if (!city.trim()) return;
    setLoadingWeather(true);
    try {
      const geo = await geocodeCity(city.trim());
      if (!geo) throw new Error('Nie znaleziono takiego miasta.');
      const w = await fetchCurrentWeather(geo.latitude, geo.longitude, `${geo.name}, ${geo.country}`);
      setWeather(w);
      setPrefs({ city: city.trim() });
    } catch (e: any) {
      showDialog('Pogoda', e?.message ?? 'Nie udało się pobrać pogody.');
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (prefs.city) loadWeatherByCity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveWeather = useManual
    ? manualWeather(Number(manualTemp) || 15, manualRain)
    : weather;

  const generate = () => {
    // pusta szafa: nie ma z czego układać — pokaż sugestie zakupów (sekcja niżej)
    if (items.length === 0) {
      setSuggestions([]);
      return;
    }
    if (!effectiveWeather) {
      showDialog('Pogoda', 'Najpierw pobierz pogodę albo ustaw ją ręcznie.');
      return;
    }
    const res = suggestOutfits(items, {
      occasion,
      timeOfDay,
      bottomPreference: bottomPref,
      styles: styles_,
      weather: effectiveWeather,
    });
    setSuggestions(res);
  };

  // sugestie zakupów, gdy nie da się złożyć zestawu
  const gaps = useMemo(() => analyzeGaps(items, stores), [items, stores]);

  const saveSuggestion = (sug: OutfitSuggestion) => {
    const label = OCCASIONS.find((o) => o.key === occasion)?.label ?? occasion;
    addOutfit({
      name: `${label} · ${new Date().toLocaleDateString('pl-PL')}`,
      itemIds: sug.items.map((i) => i.id),
      occasion,
      favorite: false,
      source: 'stylista',
    });
    showDialog('Zapisano', 'Kompozycja trafiła do zakładki Kompozycje.');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card>
        <Text style={s.cardTitle}>Pogoda</Text>
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
                odczuwalna {effectiveWeather.feelsLikeC}°C · opady {effectiveWeather.precipitationProb}%
                {effectiveWeather.city ? ` · ${effectiveWeather.city}` : ''}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: theme.colors.textMuted, marginBottom: 8 }}>Pobierz pogodę, aby stylista dobrał ubrania do warunków.</Text>
        )}
        {!useManual && (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <TextInput
                style={[s.input, { flex: 1, marginRight: 8 }]}
                placeholder="Miasto, np. Kraków"
                placeholderTextColor={theme.colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
              <PrimaryButton title="Sprawdź" onPress={loadWeatherByCity} />
            </View>
            <PrimaryButton title="Użyj mojej lokalizacji" icon="crosshairs-gps" variant="outline" onPress={loadWeatherByLocation} />
          </>
        )}
        {loadingWeather && <ActivityIndicator style={{ marginTop: 8 }} color={theme.colors.primary} />}
        <View style={s.switchRow}>
          <Text style={{ color: theme.colors.text }}>Ustaw pogodę ręcznie</Text>
          <Switch value={useManual} onValueChange={setUseManual} trackColor={{ true: theme.colors.primary }} />
        </View>
        {useManual && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TextInput
              style={[s.input, { width: 80, marginRight: 8 }]}
              keyboardType="numeric"
              value={manualTemp}
              onChangeText={setManualTemp}
            />
            <Text style={{ color: theme.colors.text, marginRight: 16 }}>°C</Text>
            <Text style={{ color: theme.colors.text, marginRight: 8 }}>Deszcz?</Text>
            <Switch value={manualRain} onValueChange={setManualRain} trackColor={{ true: theme.colors.primary }} />
          </View>
        )}
      </Card>

      <Section title="Okazja">
        <ChipRow>
          {OCCASIONS.map((o) => (
            <Chip key={o.key} label={o.label} icon={o.icon} selected={occasion === o.key} onPress={() => setOccasion(o.key)} />
          ))}
        </ChipRow>
      </Section>

      <Section title="Pora dnia">
        <ChipRow>
          {TIMES_OF_DAY.map((t) => (
            <Chip key={t.key} label={t.label} icon={t.icon} selected={timeOfDay === t.key} onPress={() => setTimeOfDay(t.key)} />
          ))}
        </ChipRow>
      </Section>

      <Section title="Sukienka czy spodnie?">
        <ChipRow>
          {(['dowolnie', 'sukienka', 'spodnie', 'spódnica'] as BottomPreference[]).map((b) => (
            <Chip key={b} label={b} selected={bottomPref === b} onPress={() => setBottomPref(b)} />
          ))}
        </ChipRow>
      </Section>

      <Section title="Preferowany styl">
        <ChipRow>
          {STYLES.map((st) => (
            <Chip
              key={st}
              label={st}
              selected={styles_.includes(st)}
              onPress={() => setStyles((prev) => (prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]))}
            />
          ))}
        </ChipRow>
      </Section>

      <PrimaryButton title="Zaproponuj kompozycje" icon="auto-fix" onPress={generate} />

      {suggestions !== null && (
        <View style={{ marginTop: 20 }}>
          <Text style={s.resultsTitle}>Propozycje stylisty</Text>
          {suggestions.length === 0 && (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <MaterialCommunityIcons name="cart-heart" size={22} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[s.cardTitle, { marginBottom: 0, flex: 1 }]}>Co warto dokupić</Text>
              </View>
              <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginBottom: 4 }}>
                {items.length === 0
                  ? 'Twoja szafa jest pusta — nie mam z czego ułożyć zestawu. Oto co warto skompletować na start:'
                  : 'Nie udało się złożyć zestawu na tę okazję i pogodę. Dodaj więcej rzeczy lub poluzuj kryteria. Warto rozważyć:'}
              </Text>
              {gaps.length > 0 ? (
                <GapSuggestions gaps={gaps} limit={6} />
              ) : (
                <Text style={{ color: theme.colors.accent, fontSize: 14, marginTop: 4 }}>
                  Podstawy masz już skompletowane 👏 — spróbuj poluzować kryteria (styl, „sukienka/spodnie”) albo dodaj kilka rzeczy pasujących do tej okazji.
                </Text>
              )}
              <PrimaryButton
                title="Dodaj rzecz do szafy"
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
                    Propozycja {idx + 1}
                  </Text>
                  <Text style={s.propCount}>{sug.items.length} części</Text>
                </View>

                <View style={s.itemsGrid}>
                  {sug.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={s.gridItem}
                      onPress={() => navigation.navigate('Szafa', { screen: 'ItemDetail', params: { id: item.id } })}
                      accessibilityRole="imagebutton"
                      accessibilityLabel={item.name}
                    >
                      <ItemThumb item={item} size={76} />
                      <Text numberOfLines={2} style={s.gridItemLabel}>
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
                    Brakuje w szafie: {sug.missing.join(', ')} — sprawdź zakładkę Więcej → Czego brakuje.
                  </Text>
                )}
                <PrimaryButton
                  title="Zapisz kompozycję"
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
      flexBasis: 320,
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
    gridItem: { width: 86, alignItems: 'center', marginHorizontal: 5, marginBottom: 10 },
    gridItemLabel: { fontSize: 11, color: theme.colors.text, marginTop: 4, textAlign: 'center' },
  });
