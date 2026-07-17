import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showDialog } from '../utils/dialog';
import { Card, Chip, ChipRow, EmptyState, ItemThumb, PrimaryButton, Section } from '../components/ui';
import { OCCASIONS, STYLES, TIMES_OF_DAY } from '../data/constants';
import { suggestOutfits } from '../logic/stylist';
import { fetchCurrentWeather, geocodeCity, manualWeather } from '../services/weather';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { BottomPreference, Occasion, OutfitSuggestion, StyleTag, TimeOfDay, WeatherInfo } from '../types';

function defaultTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h < 10) return 'rano';
  if (h < 17) return 'dzień';
  if (h < 22) return 'wieczór';
  return 'noc';
}

export default function StylistScreen({ navigation }: any) {
  const items = useAppStore((s) => s.items);
  const prefs = useAppStore((s) => s.prefs);
  const setPrefs = useAppStore((s) => s.setPrefs);
  const addOutfit = useAppStore((s) => s.addOutfit);

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
    if (!effectiveWeather) {
      showDialog('Pogoda', 'Najpierw pobierz pogodę albo ustaw ją ręcznie.');
      return;
    }
    if (items.length === 0) {
      showDialog('Pusta szafa', 'Dodaj najpierw swoje ubrania w zakładce Szafa.');
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
            <EmptyState icon="hanger" text="Za mało pasujących rzeczy w szafie na tę okazję i pogodę. Dodaj więcej ubrań albo zmień kryteria." />
          )}
          {suggestions.map((sug, idx) => (
            <Card key={idx}>
              <Text style={s.cardTitle}>Propozycja {idx + 1}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {sug.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{ marginRight: 10, alignItems: 'center', width: 76 }}
                    onPress={() => navigation.navigate('Szafa', { screen: 'ItemDetail', params: { id: item.id } })}
                  >
                    <ItemThumb item={item} size={72} />
                    <Text numberOfLines={1} style={{ fontSize: 11, color: theme.colors.text, marginTop: 2 }}>
                      {item.favorite ? '❤️ ' : ''}
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {sug.explanation.map((e, i) => (
                <Text key={i} style={s.explanation}>• {e}</Text>
              ))}
              {sug.missing.length > 0 && (
                <Text style={s.missing}>Brakuje w szafie: {sug.missing.join(', ')} — sprawdź zakładkę Więcej → Czego brakuje.</Text>
              )}
              <PrimaryButton title="Zapisz kompozycję" icon="content-save-outline" variant="outline" onPress={() => saveSuggestion(sug)} style={{ marginTop: 10 }} />
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
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
  explanation: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 3 },
  missing: { color: theme.colors.danger, fontSize: 13, marginTop: 6 },
});
