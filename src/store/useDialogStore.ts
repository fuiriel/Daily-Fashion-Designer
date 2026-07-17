import { create } from 'zustand';

export type DialogButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

interface DialogState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  show: (title: string, message?: string, buttons?: DialogButton[]) => void;
  hide: () => void;
}

// Globalny, imperatywny stan okna dialogowego. Renderowany przez <DialogHost />
// w App.tsx — dzięki temu showDialog() działa spójnie na web i telefonie,
// bez natywnych okien przeglądarki.
export const useDialogStore = create<DialogState>((set) => ({
  visible: false,
  title: '',
  message: undefined,
  buttons: [],
  show: (title, message, buttons) =>
    set({
      visible: true,
      title,
      message,
      buttons: buttons && buttons.length ? buttons : [{ text: 'OK' }],
    }),
  hide: () => set({ visible: false }),
}));
