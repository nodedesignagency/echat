import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Hatch } from './Hatch';
import { colors, type } from '../theme';

const HEIGHT = 6;
const ANGLE = -28;
/** How far the slanted edge leans across the bar's height. */
const LEAN = Math.abs(Math.tan((ANGLE * Math.PI) / 180)) * HEIGHT;

/**
 * Percentage readout. Kept as its own component so its ~15fps ticks only
 * re-render this leaf, never the surrounding conversation.
 */
export function ProgressPercent({ target }: { target: number }) {
  const [shown, setShown] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const goal = Math.round(target * 100);
      if (Math.abs(current.current - goal) < 0.5) {
        current.current = goal;
      } else {
        current.current += (goal - current.current) * 0.18;
      }
      setShown(Math.round(current.current));
    }, 66);
    return () => clearInterval(id);
  }, [target]);

  return <Text style={styles.percent}>{shown}%</Text>;
}

/**
 * Progress bar built from the same drifting diagonal stripes as the composer.
 *
 * The stripe layer spans the whole track and a skewed cover masks the unfilled
 * part, so the leading edge is cut on the stripe angle instead of ending in a
 * flat vertical chop.
 */
export function ProgressStripe({
  progress,
  width,
  duration = 900,
}: {
  progress: number;
  width: number;
  /** Match this to the step cadence so the bar never visibly stalls. */
  duration?: number;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, duration, p]);

  // The cover slides right as the bar fills; skewing it slants the cut edge.
  const coverStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * (width + LEAN) }, { skewX: `${ANGLE}deg` }],
  }));

  return (
    <View style={[styles.track, { width }]}>
      <View style={styles.fill}>
        <Hatch
          width={width}
          height={HEIGHT}
          pitch={4}
          stripeWidth={2}
          angle={ANGLE}
          drift={1.6}
          color={colors.progressStripe}
        />
      </View>
      <Animated.View style={[styles.cover, { width: width + LEAN * 2 }, coverStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: HEIGHT, borderRadius: HEIGHT / 2, backgroundColor: colors.track, overflow: 'hidden' },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.progressFill,
    overflow: 'hidden',
  },
  cover: { position: 'absolute', top: 0, bottom: 0, left: -LEAN, backgroundColor: colors.track },
  percent: { ...type.percent, color: colors.text, minWidth: 34, textAlign: 'right' },
});
