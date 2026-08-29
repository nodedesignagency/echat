import React, { useEffect } from 'react';
import Svg, { Path, G } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

/**
 * The ECHAT pinwheel, traced from the Figma artwork.
 *
 * The mark is four identical blades at 90-degree steps around (49.93, 49.93)
 * plus a four-point sparkle in the middle, authored in a 100x100 box.
 */
const BLADE =
  'M33.61 0.00L34.33 0.00L35.06 0.00L35.78 0.00L36.50 0.00L37.22 0.00L37.95 0.00L38.67 0.00L39.38 0.02L40.07 0.08L40.70 0.25L41.29 0.52L41.85 0.86L42.44 1.17L43.06 1.40L43.71 1.57L44.38 1.71L45.03 1.88L45.66 2.11L46.26 2.40L46.86 2.70L47.46 2.98L48.08 3.24L48.69 3.52L49.27 3.84L49.85 4.19L50.44 4.52L51.03 4.83L51.62 5.15L52.20 5.51L52.75 5.92L53.29 6.35L53.84 6.78L54.38 7.21L54.92 7.65L55.45 8.10L55.98 8.56L56.48 9.04L56.98 9.53L57.47 10.02L57.94 10.53L58.40 11.05L58.85 11.59L59.28 12.13L59.69 12.68L60.10 13.24L60.50 13.79L60.88 14.36L61.24 14.93L61.57 15.52L61.91 16.10L62.27 16.67L62.63 17.24L62.94 17.84L63.18 18.46L63.41 19.09L63.67 19.70L63.97 20.30L64.28 20.89L64.56 21.50L64.78 22.13L64.93 22.79L65.04 23.47L65.16 24.14L65.28 24.81L65.42 25.48L65.55 26.14L65.69 26.81L65.81 27.48L65.93 28.16L66.03 28.84L66.12 29.52L66.19 30.22L66.23 30.92L66.24 31.64L66.25 32.36L66.25 33.08L66.25 33.80L66.25 34.52L66.25 35.25L66.25 35.97L66.25 36.69L66.25 37.41L66.25 38.14L66.25 38.86L66.25 39.58L66.25 40.30L66.25 41.03L66.25 41.75L66.24 42.47L66.23 43.18L66.20 43.89L66.16 44.60L66.15 45.30L66.17 46.00L66.21 46.71L66.25 47.41L66.31 48.11L66.37 48.81L66.44 49.50L66.53 50.19L66.39 50.85L66.06 51.44L65.47 51.58L65.16 50.99L65.04 50.32L64.86 49.67L64.53 49.08L64.18 48.50L63.85 47.92L63.58 47.31L63.36 46.68L63.17 46.03L62.96 45.40L62.69 44.79L62.38 44.20L62.06 43.60L61.76 43.01L61.46 42.41L61.12 41.83L60.75 41.26L60.38 40.69L60.03 40.11L59.69 39.53L59.33 38.95L58.94 38.40L58.52 37.85L58.09 37.30L57.66 36.76L57.21 36.22L56.77 35.68L56.34 35.14L55.91 34.60L55.46 34.06L54.99 33.53L54.50 33.01L54.01 32.49L53.50 31.98L52.99 31.49L52.46 31.01L51.92 30.58L51.37 30.17L50.81 29.77L50.26 29.35L49.71 28.93L49.17 28.51L48.61 28.11L48.05 27.72L47.48 27.33L46.92 26.94L46.36 26.56L45.80 26.18L45.23 25.81L44.64 25.48L44.04 25.19L43.42 24.94L42.80 24.70L42.18 24.44L41.58 24.14L40.98 23.84L40.37 23.58L39.74 23.37L39.08 23.20L38.42 23.05L37.76 22.90L37.11 22.72L36.47 22.54L35.82 22.35L35.21 22.08L34.60 21.82L34.01 21.51L33.69 20.91L33.61 20.23L33.61 19.50L33.61 18.78L33.61 18.06L33.61 17.34L33.61 16.61L33.61 15.89L33.61 15.17L33.61 14.45L33.61 13.72L33.61 13.00L33.61 12.28L33.61 11.56L33.61 10.84L33.61 10.11L33.61 9.39L33.61 8.67L33.61 7.95L33.61 7.22L33.61 6.50L33.61 5.78L33.61 5.06L33.61 4.33L33.61 3.61L33.61 2.89L33.61 2.17L33.61 1.44L33.61 0.72Z';

const SPARK =
  'M48.89 43.33L49.30 43.33L49.67 43.42L49.96 43.71L50.19 44.02L50.43 44.33L50.67 44.64L50.90 44.96L51.10 45.28L51.31 45.61L51.51 45.93L51.74 46.25L51.99 46.55L52.27 46.83L52.57 47.10L52.87 47.36L53.18 47.61L53.49 47.83L53.82 48.02L54.17 48.18L54.52 48.31L54.88 48.43L55.23 48.57L55.56 48.76L55.83 49.06L55.72 49.42L55.53 49.75L55.24 50.04L54.92 50.27L54.61 50.50L54.31 50.75L54.00 51.00L53.70 51.25L53.39 51.50L53.08 51.75L52.78 52.00L52.49 52.27L52.21 52.55L51.94 52.85L51.68 53.15L51.42 53.45L51.17 53.76L50.94 54.07L50.73 54.39L50.53 54.72L50.32 55.04L50.10 55.36L49.88 55.68L49.59 55.97L49.22 56.06L48.89 55.97L48.61 55.68L48.47 55.33L48.36 54.97L48.25 54.60L48.15 54.24L48.02 53.88L47.84 53.54L47.63 53.22L47.39 52.91L47.14 52.61L46.86 52.33L46.57 52.07L46.26 51.84L45.93 51.63L45.61 51.44L45.28 51.23L44.97 51.00L44.66 50.75L44.37 50.47L44.08 50.19L43.79 49.90L43.50 49.61L43.31 49.28L43.33 48.98L43.56 48.66L43.89 48.47L44.27 48.40L44.65 48.32L45.01 48.21L45.37 48.09L45.71 47.93L46.03 47.74L46.32 47.49L46.59 47.22L46.87 46.95L47.16 46.68L47.46 46.41L47.75 46.13L48.04 45.85L48.14 45.48L48.23 45.11L48.32 44.73L48.40 44.36L48.47 43.98L48.61 43.63Z';

const ORIGIN = '49.93, 49.93';

export function LogoMark({ size = 20, color = colors.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {[0, 90, 180, 270].map((deg) => (
        <G key={deg} rotation={deg} origin={ORIGIN}>
          <Path d={BLADE} fill={color} />
        </G>
      ))}
      <Path d={SPARK} fill={color} />
    </Svg>
  );
}

type SpinLogoProps = {
  size?: number;
  color?: string;
  /** `idle` drifts slowly, `busy` spins up while the assistant is working. */
  mode?: 'idle' | 'busy';
};

/**
 * Continuously rotating pinwheel. The rotation never resets to 0, it just
 * changes speed, so switching modes never snaps the blades back.
 */
export function SpinningLogo({ size = 64, color = colors.text, mode = 'idle' }: SpinLogoProps) {
  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    const duration = mode === 'busy' ? 1100 : 9000;
    spin.value = withRepeat(withTiming(spin.value + 360, { duration, easing: Easing.linear }), -1, false);
  }, [mode, spin]);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [breathe]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${spin.value}deg` },
      { scale: 1 + breathe.value * (mode === 'busy' ? 0.06 : 0.035) },
    ],
  }));

  return (
    <Animated.View style={style}>
      <LogoMark size={size} color={color} />
    </Animated.View>
  );
}
