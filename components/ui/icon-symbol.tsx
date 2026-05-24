// IconSymbol.tsx

import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import {
  OpaqueColorValue,
  StyleProp,
  TextStyle,
} from 'react-native';

/**
 * Registrás acá todos los packs disponibles
 */
const ICONS = {
  material: MaterialIcons,
  ion: Ionicons,
  feather: Feather,
  fontawesome: FontAwesome,
  ant: AntDesign,
};

type IconPack = keyof typeof ICONS;

/**
 * Tipado genérico del componente
 */
type IconProps = {
  pack?: IconPack;
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
};

/**
 * Componente universal de iconos
 */
export function IconSymbol({
  pack = 'material',
  name,
  size = 24,
  color,
  style,
}: IconProps) {
  const IconComponent = ICONS[pack];

  return (
    <IconComponent
      name={name as any}
      size={size}
      color={color}
      style={style}
    />
  );
}