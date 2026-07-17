export const theme = {
  colors: {
    background: '#FAF7F2',
    card: '#FFFFFF',
    primary: '#B76E79', // przygaszony róż (rose gold)
    primaryDark: '#8E4E58',
    accent: '#6E8B74', // szałwiowa zieleń
    text: '#2E2A28',
    textMuted: '#8A817C',
    border: '#E8E0D8',
    danger: '#C0564B',
    chipBg: '#F1E9E2',
    star: '#D9A441',
  },
  radius: { sm: 8, md: 14, lg: 20 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
};

export type Theme = typeof theme;
