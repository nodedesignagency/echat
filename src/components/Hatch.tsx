import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors } from '../theme';

type HatchProps = {
  width: number;
  height: number;
  /** Distance between stripe centres, in px. Figma uses a 9px pitch. */
  pitch?: number;
  stripeWidth?: number;
  color?: string;
  angle?: number;
  /** Seconds for one stripe to travel a full pitch. 0 disables the drift. */
  drift?: number;
  style?: ViewStyle;
};

/**
 * The diagonal barber-pole texture the Figma file uses behind the composer
 * toolbar and inside the progress track. Rendered as skewed views rather than
 * an SVG pattern so the drift animation stays on the UI thread.
 */
export function Hatch({
  width,
  height,
  pitch = 9,
  stripeWidth = 4,
  color = colors.hatch,
  angle = -32,
  drift = 6,
  style,
}: HatchProps) {
  const offset = useSharedValue(0);

  useEffect(() => {
    if (!drift) return;
    offset.value = 0;
    offset.value = withRepeat(withTiming(pitch, { duration: drift * 1000, easing: Easing.linear }), -1, false);
  }, [drift, pitch, offset]);

  // Overdraw sideways so rotated stripes still cover the corners.
  const overdraw = Math.ceil(height * Math.abs(Math.tan((angle * Math.PI) / 180))) + pitch * 2;
  const count = Math.ceil((width + overdraw * 2) / pitch);
  const stripes = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  const driftStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <View pointerEvents="none" style={[{ width, height, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, driftStyle]}>
        {stripes.map((i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: -overdraw + i * pitch,
              top: -height,
              height: height * 3,
              width: stripeWidth,
              borderRadius: stripeWidth / 2,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}
