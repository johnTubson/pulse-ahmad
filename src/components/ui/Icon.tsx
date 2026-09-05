import type { IconWeight, Icon as PhosphorIcon } from 'phosphor-react-native';

type IconProps = {
  icon: PhosphorIcon;
  size?: number;
  color?: string;
  weight?: IconWeight;
  title?: string;
};

/** Thin wrapper so call sites share size/weight defaults without barrel-importing Phosphor. */
export function Icon({ icon: Glyph, size = 24, color, weight = 'regular', title }: IconProps) {
  return <Glyph size={size} color={color} weight={weight} title={title} />;
}

export type { PhosphorIcon as AppIcon };
