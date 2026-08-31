import { Easing, withTiming } from 'react-native-reanimated';

/**
 * A single overshoot-free curve for every UI transition.
 *
 * Springs were letting the tab indicator and the Pro Search knob overshoot
 * outside their tracks, so anything that slides or scales inside a bounded
 * container uses this instead.
 */
export const SMOOTH = Easing.bezier(0.22, 1, 0.36, 1);

export const glide = (to: number, duration = 280) =>
  withTiming(to, { duration, easing: SMOOTH });

/**
 * Height changes get a calmer curve than SMOOTH. SMOOTH's long slow tail
 * reads as a bounce on a large accordion, so the panel uses a plain ease-out.
 */
export const ACCORDION = Easing.out(Easing.cubic);
export const ACCORDION_MS = 300;

/** Slightly quicker variant for press feedback. */
export const tap = (to: number, duration = 160) =>
  withTiming(to, { duration, easing: SMOOTH });
