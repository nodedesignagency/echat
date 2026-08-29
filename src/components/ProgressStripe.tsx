import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Hatch } from './Hatch';
import { colors, type } from '../theme';

const HEIGHT = 6;

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
 * Segmented progress bar: a dark track filled with the same drifting diagonal
 * stripes used behind the composer, so progress reads as "work happening".
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
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, duration, w]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View style={[styles.track, { width }]}>
      <Animated.View style={[styles.fill, fillStyle]}>
        <Hatch
          width={width}
          height={HEIGHT}
          pitch={4}
          stripeWidth={2}
          angle={-28}
          drift={1.6}
          color={colors.hatchStrong}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: HEIGHT, borderRadius: HEIGHT / 2, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: HEIGHT, backgroundColor: colors.progressFill, overflow: 'hidden' },
  percent: { ...type.label, color: colors.text, minWidth: 34, textAlign: 'right' },
});
