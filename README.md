# Daily Fashion Designer 👗

Wirtualny stylista w Twoim telefonie. Aplikacja mobilna (React Native + Expo), która na
podstawie **Twojej własnej szafy** proponuje, co na siebie założyć — teraz albo na konkretny
dzień — biorąc pod uwagę pogodę, porę dnia, okazję i Twój ulubiony styl.

## Co potrafi

### 👚 Wirtualna szafa
- Dodawaj ubrania, buty i akcesoria **ze zdjęciem** (aparat lub galeria)
- Opisuj i kategoryzuj: rodzaj (sukienka, jeansy, sneakersy…), kolory, wzór, rozmiar, marka
- Opcjonalnie: data zakupu, cena, sklep — zakupy trafiają automatycznie do rejestru wydatków
- Atrybuty „mądre”: poziom ciepła (1–5), nieprzemakalność, style, okazje, pory roku
- Oznaczaj rzeczy jako **ulubione ❤️** — stylista da im pierwszeństwo
- Wyszukiwarka i filtry

### ✨ Stylista
- Propozycje kompletnych kompozycji (góra + dół lub sukienka, okrycie, buty, akcesoria)
- Kryteria: **okazja** (codzienne, praca, kino, park, rower, sport, randka, przyjęcie,
  wesele, pogrzeb, plaża), **pora dnia**, preferencja **sukienka / spodnie / spódnica**,
  **styl** (casual, elegancki, sportowy, boho…)
- **Pogoda na żywo** (Open-Meteo, bez klucza API): z lokalizacji GPS, po nazwie miasta
  albo ustawiona ręcznie
- Zna zasady: na pogrzeb tylko stonowane kolory, na wesele bez białej sukienki,
  w deszcz parasol i nieprzemakalne buty, na rower nic eleganckiego
- Ocena harmonii kolorów i wzorów; wyjaśnia, dlaczego to proponuje
- Każdą propozycję można **zapisać jako kompozycję**

### 👗 Kompozycje
- Zapisuj propozycje stylisty i **twórz własne** z rzeczy w szafie
- Dodawaj do ulubionych, notatki, przypisuj okazje

### 📅 Kalendarz stylizacji
- Planuj kompozycje na konkretne dni — widok miesiąca z oznaczeniem zaplanowanych dat
- Kilka planów na dzień, z opcjonalną porą dnia (rano / dzień / wieczór / noc)
- Jeśli u Stylisty podasz miasto, przy każdym dniu (do 16 dni w przód) zobaczysz
  prognozę pogody — łatwiej ocenić, czy plan ma sens
- Kompozycję można zaplanować też jednym dotknięciem z zakładki Kompozycje (ikona 📅)

### ✈️ Wyjazd
- Podaj cel podróży (także za granicą) i liczbę dni — aplikacja pobierze tamtejszą
  prognozę i ułoży **listę pakowania** z Twojej szafy + wskaże, czego dokupić

### 🛍️ Braki, budżet i sklepy
- Analiza braków w szafie („kapsułka minimum") z podpowiedzią **gdzie kupić**
  (Twoje ulubione sklepy lub popularne sieciówki)
- Rejestr wydatków, budżet miesięczny z ostrzeżeniem o przekroczeniu, wartość szafy
- Lista ulubionych sklepów

### 🚀 Pierwsze uruchomienie
- Przy pierwszym otwarciu aplikacja pokazuje krótkie wprowadzenie (4 ekrany) —
  można je w każdej chwili **pominąć**, a później wywołać ponownie w zakładce
  Więcej → „Pokaż wprowadzenie ponownie"

Wszystkie dane są zapisywane lokalnie na telefonie (AsyncStorage) — działa offline
(poza pobieraniem pogody). Pola z datą (np. data zakupu) mają wbudowany kalendarz
z blokadą dat z przyszłości.

## Uruchomienie

Wymagany Node.js 20+.

```bash
npm install
npx expo start
```

Następnie zeskanuj kod QR aplikacją **Expo Go** ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) — aplikacja uruchomi się na Twoim telefonie.

Budowa samodzielnej aplikacji (APK / App Store): [EAS Build](https://docs.expo.dev/build/introduction/) — `npx eas build`.

### Wersja przeglądarkowa 🌐

Ta sama aplikacja działa też w przeglądarce (react-native-web):

```bash
npm run web          # tryb deweloperski w przeglądarce
npm run build:web    # statyczny build do katalogu dist/
```

Katalog `dist/` można wystawić na dowolnym hostingu statycznym
(`npx serve dist` do szybkiego podglądu). W repozytorium jest też workflow
GitHub Actions (`.github/workflows/deploy-web.yml`), który po wypchnięciu na
główną gałąź publikuje aplikację na **GitHub Pages** — wystarczy w ustawieniach
repozytorium włączyć Pages ze źródłem „GitHub Actions".

Różnice w przeglądarce: zdjęcia dodaje się z dysku (wybór pliku), pogoda
z lokalizacji korzysta z geolokalizacji przeglądarki, a dane zapisują się
w localStorage tej przeglądarki (nie synchronizują się z telefonem).

## Struktura projektu

```
App.tsx                     – nawigacja (zakładki + stosy)
src/
  types.ts                  – model danych (rzecz, kompozycja, wydatek, pogoda…)
  data/constants.ts         – kategorie, kolory, style, okazje, formalność
  store/useAppStore.ts      – stan aplikacji (zustand + AsyncStorage)
  services/weather.ts       – pogoda i geokodowanie (Open-Meteo)
  logic/stylist.ts          – silnik doboru kompozycji (punktacja, harmonia kolorów)
  logic/gaps.ts             – analiza braków w szafie
  logic/packing.ts          – lista pakowania na wyjazd
  components/ui.tsx         – wspólne komponenty UI
  screens/                  – ekrany: Szafa, Stylista, Kompozycje, Kalendarz, Wyjazd, Więcej
```
