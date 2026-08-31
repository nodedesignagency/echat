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

/** Slightly quicker variant for press feedback. */
export const tap = (to: number, duration = 160) =>
  withTiming(to, { duration, easing: SMOOTH });
