import { useWindowDimensions } from 'react-native';
import { ViewStyle } from 'react-native';
import { lightTheme } from '../theme';

// Punkt przełamania interfejsu: poniżej — układ mobilny (dotychczasowy),
// od tej szerokości — układ „desktopowy" (boczna nawigacja, wyśrodkowana treść).
export const BREAKPOINT = lightTheme.layout.breakpoint; // 768

export function useIsWide(): boolean {
  const { width } = useWindowDimensions();
  return width >= BREAKPOINT;
}

// Styl kontenera treści: na szerokich oknach ogranicza szerokość kolumny
// tekstu/kart (czytelność wg WCAG) i wyśrodkowuje ją.
export function useContentStyle(): ViewStyle | null {
  const isWide = useIsWide();
  if (!isWide) return null;
  return {
    width: '100%',
    maxWidth: lightTheme.layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 24,
  };
}
