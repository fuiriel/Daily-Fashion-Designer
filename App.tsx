import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, NavigationContainer, Theme as NavTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DialogHost from './src/components/DialogHost';
import Onboarding from './src/components/Onboarding';
import { useI18n } from './src/i18n';
import { useAppStore, useHydrated } from './src/store/useAppStore';
import BudgetScreen from './src/screens/BudgetScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import ItemFormScreen from './src/screens/ItemFormScreen';
import MoreScreen from './src/screens/MoreScreen';
import OutfitBuilderScreen from './src/screens/OutfitBuilderScreen';
import OutfitsScreen from './src/screens/OutfitsScreen';
import StylistScreen from './src/screens/StylistScreen';
import TripScreen from './src/screens/TripScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';
import { Theme } from './src/theme';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useIsWide } from './src/theme/responsive';

const Tab = createBottomTabNavigator();
const WardrobeStack = createNativeStackNavigator();
const OutfitsStack = createNativeStackNavigator();

function stackScreenOptions(theme: Theme) {
  return {
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.text,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.background },
  };
}

function WardrobeStackScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <WardrobeStack.Navigator screenOptions={stackScreenOptions(theme)}>
      <WardrobeStack.Screen name="WardrobeList" component={WardrobeScreen} options={{ title: t('title.wardrobe') }} />
      <WardrobeStack.Screen name="ItemForm" component={ItemFormScreen} options={{ title: t('title.itemNew') }} />
      <WardrobeStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: t('title.itemDetails') }} />
    </WardrobeStack.Navigator>
  );
}

function OutfitsStackScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <OutfitsStack.Navigator screenOptions={stackScreenOptions(theme)}>
      <OutfitsStack.Screen name="OutfitsList" component={OutfitsScreen} options={{ title: t('title.outfits') }} />
      <OutfitsStack.Screen name="OutfitBuilder" component={OutfitBuilderScreen} options={{ title: t('title.newOutfit') }} />
    </OutfitsStack.Navigator>
  );
}

const TAB_ICONS: Record<string, string> = {
  Stylista: 'auto-fix',
  Szafa: 'wardrobe-outline',
  Kompozycje: 'hanger',
  Kalendarz: 'calendar-heart',
  Budżet: 'wallet-outline',
  Wyjazd: 'bag-suitcase',
  Więcej: 'dots-horizontal-circle-outline',
};

function navigationTheme(theme: Theme): NavTheme {
  const base = theme.dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };
}

// Widoczny stan focus dla nawigacji klawiaturą w przeglądarce (WCAG 2.4.7).
function useWebFocusStyles(focusColor: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      :focus-visible { outline: 2px solid ${focusColor} !important; outline-offset: 2px; }
      html { scroll-behavior: smooth; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [focusColor]);
}

function AppInner() {
  const { theme, isDark } = useTheme();
  const { t, lang } = useI18n();
  const isWide = useIsWide();
  useWebFocusStyles(theme.colors.focus);
  const hydrated = useHydrated();
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const showOnboarding = hydrated && !onboardingDone;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return (
    <NavigationContainer
      theme={navigationTheme(theme)}
      documentTitle={{
        // tytuł karty przeglądarki: „[nazwa widoku] - [nazwa aplikacji]"
        formatter: (options, route) => `${options?.title ?? route?.name ?? ''} - ${t('app.name')}`,
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {showOnboarding && <Onboarding onDone={completeOnboarding} />}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          sceneContainerStyle: { backgroundColor: theme.colors.background },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          // >=768 px: boczny pasek nawigacji (navigation rail); węziej: dolne zakładki
          tabBarPosition: isWide ? 'left' : 'bottom',
          tabBarVariant: isWide ? 'material' : 'uikit',
          tabBarLabelPosition: isWide ? 'below-icon' : undefined,
          tabBarStyle: isWide
            ? {
                backgroundColor: theme.colors.card,
                borderRightColor: theme.colors.border,
                borderRightWidth: 1,
                paddingTop: 12,
                minWidth: 96,
              }
            : { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name={TAB_ICONS[route.name] as any} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Stylista" component={StylistScreen} options={{ title: t('tab.stylist') }} />
        <Tab.Screen name="Szafa" component={WardrobeStackScreen} options={{ headerShown: false, title: t('tab.wardrobe') }} />
        <Tab.Screen name="Kompozycje" component={OutfitsStackScreen} options={{ headerShown: false, title: t('tab.outfits') }} />
        <Tab.Screen name="Kalendarz" component={CalendarScreen} options={{ title: t('title.calendar'), tabBarLabel: t('tab.calendar') }} />
        <Tab.Screen name="Budżet" component={BudgetScreen} options={{ title: t('title.budget'), tabBarLabel: t('tab.budget') }} />
        <Tab.Screen name="Wyjazd" component={TripScreen} options={{ title: t('tab.trip') }} />
        <Tab.Screen name="Więcej" component={MoreScreen} options={{ title: t('tab.more') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppInner />
        <DialogHost />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
