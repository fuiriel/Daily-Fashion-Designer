import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CalendarScreen from './src/screens/CalendarScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import ItemFormScreen from './src/screens/ItemFormScreen';
import MoreScreen from './src/screens/MoreScreen';
import OutfitBuilderScreen from './src/screens/OutfitBuilderScreen';
import OutfitsScreen from './src/screens/OutfitsScreen';
import StylistScreen from './src/screens/StylistScreen';
import TripScreen from './src/screens/TripScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();
const WardrobeStack = createNativeStackNavigator();
const OutfitsStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: theme.colors.background },
  headerTintColor: theme.colors.text,
  headerShadowVisible: false,
};

function WardrobeStackScreen() {
  return (
    <WardrobeStack.Navigator screenOptions={stackScreenOptions}>
      <WardrobeStack.Screen name="WardrobeList" component={WardrobeScreen} options={{ title: 'Moja szafa' }} />
      <WardrobeStack.Screen name="ItemForm" component={ItemFormScreen} options={{ title: 'Rzecz' }} />
      <WardrobeStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Szczegóły' }} />
    </WardrobeStack.Navigator>
  );
}

function OutfitsStackScreen() {
  return (
    <OutfitsStack.Navigator screenOptions={stackScreenOptions}>
      <OutfitsStack.Screen name="OutfitsList" component={OutfitsScreen} options={{ title: 'Kompozycje' }} />
      <OutfitsStack.Screen name="OutfitBuilder" component={OutfitBuilderScreen} options={{ title: 'Nowa kompozycja' }} />
    </OutfitsStack.Navigator>
  );
}

const TAB_ICONS: Record<string, string> = {
  Stylista: 'auto-fix',
  Szafa: 'wardrobe-outline',
  Kompozycje: 'hanger',
  Kalendarz: 'calendar-heart',
  Wyjazd: 'bag-suitcase',
  Więcej: 'dots-horizontal-circle-outline',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
            headerShadowVisible: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textMuted,
            tabBarStyle: { backgroundColor: theme.colors.card },
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name={TAB_ICONS[route.name] as any} size={size} color={color} />
            ),
          })}
        >
          <Tab.Screen name="Stylista" component={StylistScreen} options={{ title: 'Stylista' }} />
          <Tab.Screen name="Szafa" component={WardrobeStackScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Kompozycje" component={OutfitsStackScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Kalendarz" component={CalendarScreen} options={{ title: 'Kalendarz stylizacji' }} />
          <Tab.Screen name="Wyjazd" component={TripScreen} />
          <Tab.Screen name="Więcej" component={MoreScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
