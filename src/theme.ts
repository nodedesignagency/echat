/**
 * Design tokens lifted from the ECHAT Figma file (393 x 852 frames).
 * Everything in the app pulls from here so the five screens stay in sync.
 */

export const colors = {
  /* Sampled directly from the Figma frames so the build matches the file. */
  bg: '#0B0B0D',
  surface: '#0E0E10',
  surfaceRaised: '#292929',
  pill: '#292929',
  pillActive: '#333335',
  border: 'rgba(255,255,255,0.07)',
  borderSoft: 'rgba(255,255,255,0.05)',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  textDim: '#5A5A60',
  placeholder: '#48484D',
  send: '#CECECE',
  accentInk: '#0E0E10',
  toggleTrack: '#0E0E10',
  hatch: 'rgba(255,255,255,0.028)',
  hatchStrong: 'rgba(255,255,255,0.18)',
  track: '#161618',
  done: '#FFFFFF',
} as const;

export const layout = {
  /** Figma frame width — used to scale paddings on wider devices. */
  frameWidth: 393,
  gutter: 12,
  composerHeight: 114,
  composerRadius: 20,
  headerIcon: 32,
  pillHeight: 33,
  panelRadius: 16,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const type = {
  title: { fontFamily: font.bold, fontSize: 16, lineHeight: 19 },
  tagline: { fontFamily: font.bold, fontSize: 15, lineHeight: 18 },
  body: { fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  bodyLoose: { fontFamily: font.regular, fontSize: 13, lineHeight: 24 },
  label: { fontFamily: font.medium, fontSize: 13, lineHeight: 17 },
  small: { fontFamily: font.medium, fontSize: 11, lineHeight: 15 },
  reportTitle: { fontFamily: font.semibold, fontSize: 16, lineHeight: 21 },
  sectionTitle: { fontFamily: font.semibold, fontSize: 14, lineHeight: 19 },
} as const;

/** Shared motion curves so every transition in the app feels like one system. */
export const motion = {
  fast: 180,
  base: 280,
  slow: 460,
  stagger: 70,
} as const;
