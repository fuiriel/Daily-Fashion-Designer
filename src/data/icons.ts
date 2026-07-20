import { MainCategory, Slot } from '../types';
import { slotOf } from './constants';

// Ikona-SVG rzeczy bez zdjęcia. Wszystkie nazwy istnieją w MaterialCommunityIcons.
// Najpierw dopasowanie po konkretnej podkategorii, potem zapas według slotu.

const SLOT_ICON: Record<Slot, string> = {
  top: 'tshirt-crew',
  bottom: 'seat-legroom-normal',
  dress: 'hanger',
  outerwear: 'coat-rack',
  shoes: 'shoe-sneaker',
  accessory: 'bag-personal',
};

const SUBCATEGORY_ICON: Record<string, string> = {
  // góra
  't-shirt': 'tshirt-crew',
  koszula: 'tshirt-crew-outline',
  bluzka: 'tshirt-v-outline',
  top: 'tshirt-v',
  sweter: 'tshirt-crew',
  bluza: 'tshirt-crew-outline',
  // dół
  spodnie: 'seat-legroom-normal',
  jeansy: 'seat-legroom-normal',
  legginsy: 'seat-legroom-normal',
  szorty: 'seat-legroom-normal',
  spódnica: 'seat-legroom-normal',
  // sukienki / kombinezony
  sukienka: 'hanger',
  kombinezon: 'hanger',
  // okrycia
  kurtka: 'coat-rack',
  płaszcz: 'coat-rack',
  marynarka: 'coat-rack',
  żakiet: 'coat-rack',
  kamizelka: 'coat-rack',
  // buty
  sneakersy: 'shoe-sneaker',
  'buty sportowe': 'shoe-sneaker',
  botki: 'shoe-formal',
  kozaki: 'shoe-formal',
  mokasyny: 'shoe-formal',
  kalosze: 'shoe-formal',
  szpilki: 'shoe-heel',
  sandały: 'shoe-cleat',
  baleriny: 'shoe-ballet',
  // akcesoria
  torebka: 'purse',
  plecak: 'bag-personal',
  czapka: 'hat-fedora',
  kapelusz: 'hat-fedora',
  rękawiczki: 'hand-back-left',
  biżuteria: 'ring',
  'okulary przeciwsłoneczne': 'sunglasses',
  parasol: 'umbrella',
  rajstopy: 'seat-legroom-normal',
  skarpety: 'foot-print',
};

export function subcategoryIcon(mainCategory: MainCategory, subcategory: string): string {
  return SUBCATEGORY_ICON[subcategory] ?? SLOT_ICON[slotOf(mainCategory, subcategory)];
}
