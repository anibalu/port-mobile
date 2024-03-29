import RecentlyUsed from '@assets/icons/emojis/History.svg';
import Smileys from '@assets/icons/emojis/Smiley.svg';
import People from '@assets/icons/emojis/People.svg';
import Animals from '@assets/icons/emojis/Animals.svg';
import Food from '@assets/icons/emojis/FoodandDrinks.svg';
import Activities from '@assets/icons/emojis/Activities.svg';
import Travel from '@assets/icons/emojis/Travel.svg';
import Objects from '@assets/icons/emojis/Objects.svg';
import Symbols from '@assets/icons/emojis/Symbols.svg';
import Flags from '@assets/icons/emojis/Flags.svg';

import {FC} from 'react';
import {SvgProps} from 'react-native-svg';

interface EmojiCategory {
  [key: string]: {
    symbol: FC<SvgProps> | null;
    name: string;
  };
}

export const EmojiCategories: EmojiCategory = {
  all: {
    symbol: null,
    name: 'All',
  },
  history: {
    symbol: RecentlyUsed,
    name: 'Recently used',
  },
  emotion: {
    symbol: Smileys,
    name: 'Smileys & Emotion',
  },
  people: {
    symbol: People,
    name: 'People & Body',
  },
  nature: {
    symbol: Animals,
    name: 'Animals & Nature',
  },
  food: {
    symbol: Food,
    name: 'Food & Drink',
  },
  activities: {
    symbol: Activities,
    name: 'Activities',
  },
  places: {
    symbol: Travel,
    name: 'Travel & Places',
  },
  objects: {
    symbol: Objects,
    name: 'Objects',
  },
  symbols: {
    symbol: Symbols,
    name: 'Symbols',
  },
  flags: {
    symbol: Flags,
    name: 'Flags',
  },
};
