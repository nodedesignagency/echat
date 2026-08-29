import React, { useEffect, useMemo, useRef } from 'react';
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

type Props = {
  text: string;
  style?: StyleProp<TextStyle>;
  /** Words revealed per second. */
  speed?: number;
  enabled?: boolean;
  onDone?: () => void;
};

/** How many words either side of the leading edge are mid-transition. */
const FEATHER = 2.5;

/**
 * Reveals copy word by word: each word rises, fades and settles as the leading
 * edge sweeps past it, so the answer arrives as a soft wave rather than a
 * mechanical typewriter.
 *
 * A single shared value drives every word, so a long report costs one animation
 * rather than one per word.
 */
export function RevealText({ text, style, speed = 26, enabled = true, onDone }: Props) {
  const words = useMemo(() => text.split(/(\s+)/).filter((w) => w.length > 0), [text]);
  const count = words.filter((w) => w.trim().length > 0).length;

  const edge = useSharedValue(enabled ? 0 : count + FEATHER);
  const finished = useRef(false);

  useEffect(() => {
    if (!enabled) {
      edge.value = count + FEATHER;
      return;
    }
    finished.current = false;
    edge.value = 0;
    edge.value = withTiming(
      count + FEATHER,
      { duration: ((count + FEATHER) / speed) * 1000, easing: Easing.linear },
      (done) => {
        if (done && onDone) runOnJS(onDone)();
      },
    );
    // onDone is a stable callback supplied by the driver.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled, count, speed]);

  // Match the gap to the font's own space advance (~0.26em in Inter) so the
  // wrapped layout reads like normal running text.
  const fontSize = (StyleSheet.flatten(style) as TextStyle | undefined)?.fontSize ?? 13;
  const gap = Math.round(fontSize * 0.26 * 10) / 10;

  let wordIndex = -1;

  return (
    <View style={styles.wrap}>
      {words.map((w, i) => {
        if (!w.trim()) return null;
        wordIndex += 1;
        return (
          <Word key={i} index={wordIndex} edge={edge} style={style} gap={gap}>
            {w}
          </Word>
        );
      })}
    </View>
  );
}

function Word({
  index,
  edge,
  style,
  gap,
  children,
}: {
  index: number;
  edge: SharedValue<number>;
  style?: StyleProp<TextStyle>;
  gap: number;
  children: string;
}) {
  const animated = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (edge.value - index) / FEATHER));
    // ease-out so words settle rather than stop dead
    const e = 1 - (1 - t) * (1 - t);
    return {
      opacity: e,
      transform: [{ translateY: (1 - e) * 7 }, { scale: 0.96 + e * 0.04 }],
    };
  });

  return (
    <Animated.Text style={[style, { marginRight: gap }, animated]} allowFontScaling={false}>
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
