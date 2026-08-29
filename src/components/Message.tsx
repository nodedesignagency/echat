import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LogoMark } from './Logo';
import { colors, controlStroke, layout, type } from '../theme';

/** Right-aligned user message, rendered as a pill exactly like the Figma. */
export function UserBubble({ text }: { text: string }) {
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateX: (1 - enter.value) * 26 }, { scale: 0.94 + enter.value * 0.06 }],
  }));

  return (
    <Animated.View style={[styles.userRow, style]}>
      <View style={styles.userPill}>
        <Text style={styles.userText}>{text}</Text>
      </View>
    </Animated.View>
  );
}

/** One of the three staggered dots shown while EDITH is thinking. */
function Dot({ size, delay, offset }: { size: number; delay: number; offset: number }) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 520, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, v]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + v.value * 0.65,
    transform: [{ translateY: -v.value * 3 }, { scale: 0.82 + v.value * 0.28 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: offset,
          bottom: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.text,
        },
        style,
      ]}
    />
  );
}

/**
 * The 28x28 assistant slot. While a turn is in flight it shows the three
 * growing dots from the Figma; once answered it cross-fades to the pinwheel.
 */
export function AssistantAvatar({ thinking }: { thinking: boolean }) {
  if (thinking) {
    return (
      <Animated.View entering={FadeIn.duration(220)} style={styles.avatar}>
        <View style={styles.dots}>
          <Dot size={4} delay={0} offset={0} />
          <Dot size={6} delay={130} offset={8} />
          <Dot size={8} delay={260} offset={18} />
        </View>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={FadeIn.duration(320)} style={styles.avatar}>
      <LogoMark size={22} />
    </Animated.View>
  );
}

/** Status line, e.g. "EDITH is thinking…" or "General Conversation". */
export function StatusLine({ text, dim }: { text: string; dim?: boolean }) {
  return (
    <Animated.Text entering={FadeIn.duration(260)} style={[styles.status, dim && { color: colors.textMuted }]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  userRow: { alignItems: 'flex-end', paddingHorizontal: layout.gutter },
  userPill: {
    minHeight: layout.pillHeight,
    justifyContent: 'center',
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '82%',
    backgroundColor: colors.pill,
    ...controlStroke,
  },
  userText: { ...type.label, color: colors.text },
  avatar: { width: 28, height: 28, alignItems: 'flex-start', justifyContent: 'center', marginLeft: layout.gutter },
  dots: { width: 28, height: 10, justifyContent: 'flex-end' },
  status: { ...type.label, color: colors.text, paddingHorizontal: layout.gutter },
});
