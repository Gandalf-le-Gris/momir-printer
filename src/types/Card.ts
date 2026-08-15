import { Color } from "./Color";

export interface Card {
  id: string,
  oracle_id: string,
  name: string,
  lang: string,
  image_uris?: {
    small?: string,
    normal?: string,
    large?: string,
    png?: string,
  },
  mana_cost: string,
  cmc: number,
  type_line: string,
  oracle_text: string,
  printed_name: string,
  printed_text: string,
  printed_type_line: string,
  power?: number,
  toughness?: number,
  colors: Color[],
  color_identity: Color[],
  artist: string,
  rarity: string,
  card_faces?: Card[],
}

export function getPng(card: Card): string {
  let uris;
  if (card.image_uris) {
    uris = card.image_uris;
  } else if (card.card_faces?.[0]?.image_uris) {
    uris = card.card_faces[0].image_uris;
  } else {
    return '';
  }
  return uris.png ?? uris.large ?? uris.normal ?? uris.small ?? '';
}
