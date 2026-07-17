import { Alert, Platform } from 'react-native';

export type DialogButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

// Wieloplatformowy dialog. Na telefonie używa natywnego Alert, a w przeglądarce
// window.alert / window.confirm — bo react-native-web nie implementuje Alert
// (Alert.alert to tam pusta funkcja, więc komunikaty i potwierdzenia nie działają).
export function showDialog(title: string, message?: string, buttons?: DialogButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons as any);
    return;
  }
  const body = message ? `${title}\n\n${message}` : title;

  // 0–1 przycisk → zwykły komunikat informacyjny
  if (!buttons || buttons.length <= 1) {
    if (typeof window !== 'undefined') window.alert(body);
    buttons?.[0]?.onPress?.();
    return;
  }

  // 2+ przyciski → potwierdź / anuluj
  const confirmBtn = buttons.find((b) => b.style !== 'cancel') ?? buttons[buttons.length - 1];
  const cancelBtn = buttons.find((b) => b.style === 'cancel');
  const ok = typeof window !== 'undefined' ? window.confirm(body) : true;
  if (ok) confirmBtn?.onPress?.();
  else cancelBtn?.onPress?.();
}
