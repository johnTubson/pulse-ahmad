import type { Icon } from 'phosphor-react-native';
import { BankIcon } from 'phosphor-react-native/src/icons/Bank';
import { BasketIcon } from 'phosphor-react-native/src/icons/Basket';
import { BookOpenIcon } from 'phosphor-react-native/src/icons/BookOpen';
import { CarIcon } from 'phosphor-react-native/src/icons/Car';
import { DotsThreeCircleIcon } from 'phosphor-react-native/src/icons/DotsThreeCircle';
import { FilmSlateIcon } from 'phosphor-react-native/src/icons/FilmSlate';
import { ForkKnifeIcon } from 'phosphor-react-native/src/icons/ForkKnife';
import { GiftIcon } from 'phosphor-react-native/src/icons/Gift';
import { HandbagIcon } from 'phosphor-react-native/src/icons/Handbag';
import { LightbulbIcon } from 'phosphor-react-native/src/icons/Lightbulb';
import { MopedIcon } from 'phosphor-react-native/src/icons/Moped';
import { PillIcon } from 'phosphor-react-native/src/icons/Pill';

import type { CategoryId } from '@/types/finance';

export const CATEGORY_META: Record<CategoryId, { icon: Icon; label: string; shortLabel: string }> =
  {
    groceries: { icon: BasketIcon, label: 'Food & Groceries', shortLabel: 'Food & groceries' },
    'eating-out': { icon: ForkKnifeIcon, label: 'Eating Out', shortLabel: 'Eating out' },
    delivery: { icon: MopedIcon, label: 'Delivery', shortLabel: 'Delivery' },
    transport: { icon: CarIcon, label: 'Transport', shortLabel: 'Transport' },
    shopping: { icon: HandbagIcon, label: 'Shopping', shortLabel: 'Shopping' },
    entertainment: { icon: FilmSlateIcon, label: 'Entertainment', shortLabel: 'Fun' },
    bills: { icon: LightbulbIcon, label: 'Bills & Utilities', shortLabel: 'Bills & utilities' },
    health: { icon: PillIcon, label: 'Health', shortLabel: 'Health' },
    education: { icon: BookOpenIcon, label: 'Education', shortLabel: 'Education' },
    gifts: { icon: GiftIcon, label: 'Gifts & Donations', shortLabel: 'Gifts & social' },
    savings: { icon: BankIcon, label: 'Savings & Investment', shortLabel: 'Savings' },
    other: { icon: DotsThreeCircleIcon, label: 'Other', shortLabel: 'Other' },
  };
