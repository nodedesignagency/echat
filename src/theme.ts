/**
 * Design tokens lifted from the ECHAT Figma file (393 x 852 frames).
 * Everything in the app pulls from here so the five screens stay in sync.
 */

export const colors = {
  /*
   * Values marked (measured) were sampled pixel-by-pixel from the exported
   * Figma frame. The rest are derived from those so the palette stays
   * internally consistent.
   */
  bg: '#0B0B0D',                 // measured — page background
  surface: '#0E0E10',            // measured — composer / panel fill
  panelHeader: '#181818',        // Figma — the 369x55 panel header block
  surfaceBorder: '#1C1C1E',      // measured — 1px stroke around surfaces
  composerBorder: 'rgba(37, 37, 39, 0.6)',  // Figma — #252527 at 60%
  divider: '#2D2D2F',            // measured — rule between composer rows
  pill: '#292929',               // measured — every control fill

  /* Controls carry a top-lit bevel: a 1px stroke that is lightest on the top
   * edge and darkest on the bottom. All three values measured. */
  controlBorderTop: '#444248',
  controlBorder: '#37363B',
  controlBorderBottom: '#2B2A2F',

  pillActive: '#333335',
  send: '#CECECE',               // measured — send button fill
  sendBorder: '#EBEBEB',         // measured — send button stroke
  accentInk: '#0E0E10',

  text: '#FFFFFF',               // measured
  placeholder: '#3E3E40',        // measured — composer placeholder
  textBody: '#8E8E93',           // report paragraphs, source domains
  textMuted: '#6E6E73',          // derived — secondary labels
  textDim: '#4A4A50',            // derived — inactive / pending

  toggleTrack: '#0E0E10',        // measured — Pro Search toggle track
  toggleTrackOn: 'rgba(255,255,255,0.14)',
  focusBorder: '#3A3A40',        // derived — composer stroke while focused

  /* Tab group, read from the Figma inspector: the track is the page colour
   * with a #403F44 hairline and an inner shadow, so it reads as recessed. */
  segment: '#0B0B0D',
  segmentBorder: '#403F44',
  segmentPillBorder: '#2C2B30',

  ring: 'rgba(255,255,255,0.18)',         // active step pulse
  rail: 'rgba(255,255,255,0.10)',         // timeline connector, pending
  railActive: 'rgba(255,255,255,0.55)',   // timeline connector, drawn
  progressFill: 'rgba(255,255,255,0.13)',
  progressStripe: 'rgba(255,255,255,0.92)',  // the filled bar reads near-white

  hatch: 'rgba(255,255,255,0.016)',       // measured — +4 levels over the surface
  hatchStrong: 'rgba(255,255,255,0.18)',
  track: '#161618',
  scrim: 'rgba(0,0,0,0.60)',     // sheet backdrop
  scrimHeavy: 'rgba(6,6,7,0.94)', // voice overlay
  done: '#FFFFFF',
} as const;

/**
 * The 1px bevelled stroke shared by every control in the design.
 * RN honours per-side border colours, which reproduces the Figma gradient.
 */
export const controlStroke = {
  borderWidth: 1,
  borderColor: colors.controlBorder,
  borderTopColor: colors.controlBorderTop,
  borderBottomColor: colors.controlBorderBottom,
} as const;

/** Soft downward shadow the Figma frame casts under raised surfaces. */
export const surfaceShadow = {
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.45)',
} as const;

/** Inner shadow on the tab track (Figma: 0/0, blur 7.3, black 53%). */
export const insetShadow = {
  boxShadow: 'inset 0px 0px 7.3px rgba(0, 0, 0, 0.53)',
} as const;

/** Drop shadow under the selected tab pill. */
export const pillShadow = {
  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.5)',
} as const;


export const layout = {
  /** Figma frame width — used to scale paddings on wider devices. */
  frameWidth: 393,
  gutter: 12,
  composerHeight: 114,
  composerRadius: 28,   // Figma
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

/*
 * Sizes calibrated by measuring Inter against the text-node widths recorded in
 * the Figma file (e.g. "Edith is thinking..." is 119px wide there, which is
 * Inter Medium at 14px, not 13). Wrapped text was matched by line breaks.
 */
export const type = {
  title: { fontFamily: font.bold, fontSize: 16, lineHeight: 19 },
  tagline: { fontFamily: font.bold, fontSize: 15.5, lineHeight: 19 },
  body: { fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  /** Research step copy: 3 lines fill the 72-tall frame in the design. */
  bodyLoose: { fontFamily: font.regular, fontSize: 14, lineHeight: 24 },
  /** Report paragraphs: 8 lines fill the 144-tall frame in the design. */
  reportBody: { fontFamily: font.regular, fontSize: 12, lineHeight: 18 },
  sourceTitle: { fontFamily: font.regular, fontSize: 12, lineHeight: 15 },
  domain: { fontFamily: font.regular, fontSize: 13.5, lineHeight: 17 },
  /** Composer input, pills, status line, panel header — all 14 in the file. */
  label: { fontFamily: font.medium, fontSize: 14, lineHeight: 17 },
  percent: { fontFamily: font.medium, fontSize: 13.5, lineHeight: 17 },
  small: { fontFamily: font.medium, fontSize: 11.5, lineHeight: 15 },
  reportTitle: { fontFamily: font.semibold, fontSize: 16, lineHeight: 19 },
  sectionTitle: { fontFamily: font.semibold, fontSize: 16, lineHeight: 19 },
} as const;

/** Shared motion curves so every transition in the app feels like one system. */
export const motion = {
  fast: 180,
  base: 280,
  slow: 460,
  stagger: 70,
} as const;
