import { Color } from "./Color";

export interface Card {
  id: string,
  oracle_id: string,
  name: string,
  lang: string,
  image_uris: {
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
}
