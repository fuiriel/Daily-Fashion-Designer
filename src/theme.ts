export interface ThemeColors {
  background: string;
  card: string;
  cardAlt: string;
  primary: string;
  primaryDark: string;
  onPrimary: string;
  accent: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  chipBg: string;
  star: string;
  overlay: string;
  focus: string;
}

const radius = { sm: 8, md: 14, lg: 20 };
const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const layout = { maxContentWidth: 1120, breakpoint: 768 };

export const lightTheme = {
  dark: false,
  colors: {
    background: '#FAF7F2',
    card: '#FFFFFF',
    cardAlt: '#F6F0EA',
    primary: '#A85462', // przygaszony róż o kontraście AA z bielą
    primaryDark: '#8E4E58',
    onPrimary: '#FFFFFF',
    accent: '#4F7059', // ciemniejsza szałwia (kontrast AA na jasnym tle)
    text: '#2E2A28',
    textMuted: '#6E655F', // ciemniejszy niż wcześniej — spełnia WCAG AA
    border: '#E4DBD1',
    danger: '#B4453B',
    chipBg: '#F1E9E2',
    star: '#B7871F',
    overlay: 'rgba(0,0,0,0.45)',
    focus: '#2D7DD2',
  } as ThemeColors,
  radius,
  spacing,
  layout,
};

export const darkTheme: typeof lightTheme = {
  dark: true,
  colors: {
    background: '#1A1618',
    card: '#262023',
    cardAlt: '#2F282B',
    primary: '#C97F8B', // jaśniejszy róż dla ciemnego tła
    primaryDark: '#B76E79',
    onPrimary: '#2A1418',
    accent: '#8FB39A',
    text: '#F2ECE7',
    textMuted: '#B4ABA3',
    border: '#3B3234',
    danger: '#E68B80',
    chipBg: '#332A2E',
    star: '#E0B24E',
    overlay: 'rgba(0,0,0,0.6)',
    focus: '#6BB0FF',
  } as ThemeColors,
  radius,
  spacing,
  layout,
};

export type Theme = typeof lightTheme;
