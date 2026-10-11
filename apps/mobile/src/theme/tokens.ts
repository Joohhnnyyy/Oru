/**
 * Oru Mobile App Color System & Tokens
 * Directly implemented from /Users/anshjohnson/Oru/apps/ORU_MOBILE_APP_COLOR_SYSTEM.md
 * Supports both Bright Mode (Clean Light Canvas) and Dark Mode (Obsidian Neon Surface).
 */

export const oruBrand = {
  bg: '#05070C',          // Main dark obsidian canvas
  face: '#05070C',        // Dark logo/icon face
  cyan: '#00CFFF',        // Primary accent, active state, key progress
  turquoise: '#00E5D4',   // Secondary accent and gradient transition
  lime: '#43E34F',        // Positive / energetic highlight, territory health
  yellow: '#FFE34D',      // Warm accent, highlights, badges
  pink: '#FF83D0',        // Secondary decorative accent
  lavender: '#B8A7FF',    // Glow & illustration detail
  highlight: '#F7FFFF',   // Specular edge and bright text
};

export const darkTheme = {
  isDark: true,
  mode: 'dark' as const,
  // Surfaces
  bg: '#05070C',          // oru.bg
  surface1: '#0B0F16',    // mobile.surface.1
  surface2: '#111824',    // mobile.surface.2
  surface3: '#192231',    // mobile.surface.3
  card: '#0B0F16',        // mobile.surface.1
  cardElevated: '#111824',// mobile.surface.2
  cardSelected: '#192231',// mobile.surface.3
  border: '#273344',      // mobile.border
  borderSubtle: '#192231',
  borderAccent: '#00CFFF',
  
  // Text
  textPrimary: '#F7FFFF', // mobile.text.primary / oru.highlight
  textSecondary: '#B5C0CF',// mobile.text.secondary
  textMuted: '#7F8B9C',   // mobile.text.muted
  
  // Actions & Navigation
  actionPrimary: '#00CFFF',// mobile.action.primary
  actionPressed: '#00A9D1',// mobile.action.pressed
  actionText: '#05070C',
  tabBarBg: '#0B0F16',
  tabBarBorder: '#192231',
  tabBarActive: '#00CFFF',
  tabBarInactive: '#7F8B9C',
  
  // Status & Indicators
  success: '#43E34F',     // mobile.success
  warning: '#FFE34D',     // mobile.warning
  error: '#FF6B7A',       // mobile.error
  info: '#00CFFF',        // mobile.info
  badgeBg: 'rgba(67, 227, 79, 0.16)',
  badgeText: '#43E34F',
  progressBarBg: '#192231',
  progressBarFill: '#00CFFF',
  statDivider: '#273344',
  
  // Brand accents
  accentCyan: '#00CFFF',
  accentTurquoise: '#00E5D4',
  accentLime: '#43E34F',
  accentYellow: '#FFE34D',
  accentPink: '#FF83D0',
  accentLavender: '#B8A7FF',
  highlight: '#F7FFFF',
  inkAccent: {
    accentCyan: '#00CFFF',
    accentTurquoise: '#00E5D4',
    accentLime: '#43E34F',
    accentYellow: '#FFE34D',
    accentPink: '#FF83D0',
    accentLavender: '#B8A7FF',
  },
};

export const brightTheme = {
  isDark: false,
  mode: 'bright' as const,
  // Surfaces: warm cream ground like the logo artwork, black "ink" for emphasis
  bg: '#F8F7F2',
  surface1: '#FFFFFF',
  surface2: '#F1EFE7',
  surface3: '#E6E3D8',
  card: '#FFFFFF',
  cardElevated: '#F1EFE7',
  cardSelected: '#E6E3D8',
  border: '#E4E1D6',
  borderSubtle: '#EEEBE1',
  borderAccent: '#00CFFF',

  // Text
  textPrimary: '#05070C',
  textSecondary: '#5B6270',
  textMuted: '#8C919C',

  // Actions & Navigation
  actionPrimary: '#00CFFF',
  actionPressed: '#0093B3',
  actionText: '#05070C',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E4E1D6',
  tabBarActive: '#0088B0',
  tabBarInactive: '#8C919C',

  // Status & Indicators
  success: '#1E9E2B',
  warning: '#A87F00',
  error: '#E5485A',
  info: '#00CFFF',
  badgeBg: 'rgba(67, 227, 79, 0.18)',
  badgeText: '#1E9E2B',
  progressBarBg: '#E6E3D8',
  progressBarFill: '#00CFFF',
  statDivider: '#E4E1D6',

  // Brand accents (fills)
  accentCyan: '#00CFFF',
  accentTurquoise: '#00E5D4',
  accentLime: '#43E34F',
  accentYellow: '#FFE34D',
  accentPink: '#FF83D0',
  accentLavender: '#B8A7FF',
  highlight: '#F7FFFF',

  // Readable versions of the accents for text on the cream ground
  inkAccent: {
    accentCyan: '#0088B0',
    accentTurquoise: '#0D9488',
    accentLime: '#1E9E2B',
    accentYellow: '#A87F00',
    accentPink: '#C2308F',
    accentLavender: '#6F55D6',
  },
};

export type AppTheme = typeof darkTheme;

// Default colors mapping for static styling
export const colors = {
  // Light Mode Surfaces
  surfaceBase: '#F8FAFC',
  surfaceCard: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  surfaceRaised: '#00E5D4',
  surfaceDarkCTA: '#05070C',
  surfaceSubtle: 'rgba(0, 0, 0, 0.04)',
  surfaceAccentSubtle: 'rgba(0, 229, 212, 0.12)',
  surfaceGreenSubtle: 'rgba(67, 227, 79, 0.12)',

  // Dark Obsidian Surfaces
  obsidianBg: '#05070C',
  obsidianCard: '#0B0F16',
  obsidianElevated: '#111824',
  obsidianBorder: '#273344',
  obsidianText: '#F7FFFF',
  obsidianTextSub: '#B5C0CF',
  obsidianTextMuted: '#7F8B9C',

  // Borders
  borderSubtle: '#E2E8F0',
  borderLight: '#CBD5E1',
  borderAccent: '#00E5D4',
  borderAccentSubtle: 'rgba(0, 229, 212, 0.35)',
  borderDark: '#273344',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textDark: '#05070C',
  textAccent: '#0D9488',
  textWhite: '#F7FFFF',
  textGreen: '#43E34F',
  textCyan: '#00CFFF',

  // Brand Accents
  accentCyan: '#00CFFF',
  accentTurquoise: '#00E5D4',
  accentLime: '#43E34F',
  accentYellow: '#FFE34D',
  accentPink: '#FF83D0',
  accentLavender: '#B8A7FF',

  // Status
  success: '#059669',
  warning: '#FFE34D',
  error: '#FF6B7A',
  info: '#00CFFF',
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 50,
};

export const spacing = {
  s1: 10,
  s2: 14,
  s3: 20,
  s4: 24,
  s5: 32,
  s6: 50,
};

export const typography = {
  // Fredoka: rounded, bubbly display face that matches the logo. Nunito: friendly body/UI face.
  fontBody: 'Nunito_600SemiBold',
  fontBodyRegular: 'Nunito_400Regular',
  fontBodyMedium: 'Nunito_600SemiBold',
  fontBodySemiBold: 'Nunito_700Bold',
  fontBodyBold: 'Nunito_800ExtraBold',
  fontBodyExtraBold: 'Nunito_800ExtraBold',

  fontDisplay: 'Fredoka_700Bold',
  fontDisplayMedium: 'Fredoka_500Medium',
  fontDisplaySemiBold: 'Fredoka_600SemiBold',
  fontDisplayBold: 'Fredoka_600SemiBold',
  fontDisplayExtraBold: 'Fredoka_700Bold',

  // Hierarchy Scale (px)
  hero: 32,          // 28-34 px (700-800)
  screenHeading: 26, // 24-28 px (700)
  sectionHeading: 20,// 18-22 px (600-700)
  cardTitle: 16.5,   // 16-18 px (600)
  body: 15,          // 14-16 px (400-500)
  button: 15,        // 14-16 px (600)
  label: 12.5,       // 12-13 px (500-600)
  metric: 32,        // 28-36 px (700-800)
};

