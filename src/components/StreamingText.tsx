import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../theme';

type Props = {
  text: string;
  style?: StyleProp<TextStyle>;
  /** Characters revealed per tick. Higher = faster stream. */
  chunk?: number;
  tick?: number;
  startDelay?: number;
  enabled?: boolean;
  onDone?: () => void;
};

/**
 * Reveals text progressively so answers arrive the way a model streams them
 * rather than appearing all at once. Self-contained: ticking re-renders only
 * this leaf.
 */
export function StreamingText({ text, style, chunk = 3, tick = 26, startDelay = 0, enabled = true, onDone }: Props) {
  const [shown, setShown] = useState(enabled ? 0 : text.length);
  const done = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setShown(text.length);
      return;
    }
    done.current = false;
    setShown(0);

    let n = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        n = Math.min(text.length, n + chunk);
        setShown(n);
        if (n >= text.length) {
          clearInterval(interval);
          if (!done.current) {
            done.current = true;
            onDone?.();
          }
        }
      }, tick);
    }, startDelay);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
    // onDone intentionally excluded: it is a stable callback from the driver.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled, chunk, tick, startDelay]);

  const visible = text.slice(0, shown);
  const streaming = enabled && shown < text.length;

  return (
    <Text style={style}>
      {visible}
      {streaming ? <Caret /> : null}
    </Text>
  );
}

/** Block caret that trails the streaming text. */
function Caret() {
  return (
    <Animated.Text entering={FadeIn.duration(120)} style={{ color: colors.textMuted }}>
      ▍
    </Animated.Text>
  );
}
