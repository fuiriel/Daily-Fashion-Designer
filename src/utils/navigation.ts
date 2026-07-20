// Otwarcie formularza przedmiotu z dowolnej zakładki.
//
// Domyślnie `navigate('Szafa', { screen: 'ItemForm' })` przy pierwszym wejściu
// do stosu Szafy ustawia go na sam formularz (bez ekranu listy pod spodem),
// przez co nie ma przycisku wstecz i nie da się wrócić do szafy. Opcja
// `initial: false` sprawia, że pod formularzem ląduje ekran startowy stosu
// (lista szafy) — dzięki temu stos to [WardrobeList, ItemForm]: jest przycisk
// wstecz, a dotknięcie zakładki Szafa wraca do listy.
export function openItemForm(navigation: any, params: Record<string, any> = {}) {
  navigation.navigate('Szafa', { screen: 'ItemForm', params, initial: false });
}
