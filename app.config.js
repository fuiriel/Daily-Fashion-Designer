// Rozszerza app.json: pozwala ustawić ścieżkę bazową builda webowego,
// np. EXPO_BASE_URL=/Daily-Fashion-Designer przy publikacji na GitHub Pages.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL || undefined,
  },
});
