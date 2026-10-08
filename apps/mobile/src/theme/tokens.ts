/**
 * Butter Video Design Tokens for Mobile App
 * Clean, functional, high-contrast implementation-oriented theme.
 */

export const colors = {
  // Surface tokens
  surfaceBase: '#000000',       // Deep pitch black
  surfaceCard: '#0f0f0f',       // Charcoal card
  surfaceElevated: '#161616',   // Slightly elevated card
  surfaceRaised: '#00ffd0',     // Signature Butter Electric Mint / Teal
  surfaceStrong: '#ededed',     // Off-white / light surface
  surfaceSubtle: 'rgba(255, 255, 255, 0.05)',
  surfaceAccentSubtle: 'rgba(0, 255, 208, 0.12)',

  // Borders
  borderSubtle: '#222222',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  borderAccent: '#00ffd0',
  borderAccentSubtle: 'rgba(0, 255, 208, 0.35)',

  // Typography
  textPrimary: '#fafafa',       // Crisp white
  textSecondary: '#b6b6b6',     // Cool gray
  textTertiary: '#737373',      // Muted label
  textDark: '#0f0f0f',          // Ink black for buttons with #00ffd0 background
  textAccent: '#00ffd0',        // Electric mint accent

  // Semantic status
  success: '#00ffd0',
  warning: '#f59e0b',
  error: '#ff4d4f',
  info: '#3b82f6',
};

export const radii = {
  xs: 5,
  sm: 8,
  md: 16,
  lg: 24,
  pill: 50,                     // Signature Butter pill buttons and badges
};

export const spacing = {
  s1: 10,
  s2: 14,
  s3: 20,
  s4: 24,
  s5: 32,
  s6: 50,
};
