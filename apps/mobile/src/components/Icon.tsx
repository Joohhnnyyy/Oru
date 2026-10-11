import React from 'react';
import {
  House, MapPin, Gift, User, Flame, Gem, ScanLine, ChevronLeft, ChevronRight, Zap, Image as ImageIcon, X, Check,
  Trophy, Truck, Bell, Crown, Leaf, Search, Users, TrendingUp, Moon, Sun, LogOut, Sparkles, Camera,
  Navigation, Recycle, Target, Star, Lock,
} from 'lucide-react-native';

const ICONS = {
  home: House,
  map: MapPin,
  gift: Gift,
  user: User,
  flame: Flame,
  gem: Gem,
  scan: ScanLine,
  back: ChevronLeft,
  next: ChevronRight,
  bolt: Zap,
  image: ImageIcon,
  close: X,
  check: Check,
  trophy: Trophy,
  truck: Truck,
  bell: Bell,
  crown: Crown,
  leaf: Leaf,
  search: Search,
  users: Users,
  trend: TrendingUp,
  moon: Moon,
  sun: Sun,
  logout: LogOut,
  sparkles: Sparkles,
  camera: Camera,
  nav: Navigation,
  recycle: Recycle,
  target: Target,
  star: Star,
  lock: Lock,
} as const;

export type IconName = keyof typeof ICONS;

/** One icon set for the whole app (Lucide). `filled` fills the shape with the stroke colour. */
export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
  filled?: boolean;
}> = ({ name, size = 22, color, strokeWidth = 2.5, filled }) => {
  const C = ICONS[name] as any;
  return <C size={size} color={color} strokeWidth={strokeWidth} fill={filled ? color : 'none'} />;
};
