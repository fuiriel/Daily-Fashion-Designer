import { DialogButton, useDialogStore } from '../store/useDialogStore';

export type { DialogButton };

// Pokazuje własne okno dialogowe aplikacji (spójne z motywem, z przyciskiem OK
// lub OK/Anuluj). Sygnatura zgodna z dotychczasowym API, więc wywołania w
// ekranach nie wymagają zmian. Renderowaniem zajmuje się <DialogHost />.
export function showDialog(title: string, message?: string, buttons?: DialogButton[]) {
  useDialogStore.getState().show(title, message, buttons);
}
