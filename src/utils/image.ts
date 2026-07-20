import { Platform } from 'react-native';

// Zamienia wynik ImagePickera na adres zdjęcia, który przeżyje odświeżenie strony.
//
// Na webie `asset.uri` to `blob:…` — chwilowy uchwyt ważny tylko do przeładowania
// karty. Po refreshu wskazuje w pustkę i zdjęcie się nie ładuje. Dlatego na webie
// zapisujemy trwały data URI z bajtów base64 (ImagePicker dostaje `base64: true`).
// Na telefonie `asset.uri` to ścieżka `file://`, która jest trwała — i tańsza od
// pakowania całego obrazu w base64 do pamięci — więc zostawiamy ją bez zmian.
export function toPersistentPhotoUri(asset: { uri: string; base64?: string | null; mimeType?: string | null }): string {
  if (Platform.OS === 'web' && asset.base64) {
    const mime = asset.mimeType || 'image/jpeg';
    return `data:${mime};base64,${asset.base64}`;
  }
  return asset.uri;
}
