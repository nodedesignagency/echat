import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Hatch } from './Hatch';
import { ArrowUpIcon, PlusIcon, WaveformIcon } from './icons';
import { colors, controlStroke, layout, surfaceShadow, type } from '../theme';
import { glide, tap } from '../motion';

/* Figma composer is 114 tall: 1px stroke, a 56 input row, a 1px rule,
 * a 55 toolbar row, then the closing 1px stroke. */
const INPUT_ROW = 56;
const TOOL_ROW = 55;

/** Mini switch inside the Pro Search pill. 24x12 track, per the Figma spec. */
function ProToggle({ on }: { on: boolean }) {
  const v = useSharedValue(on ? 1 : 0);

  useEffect(() => {
    v.value = glide(on ? 1 : 0, 240);
  }, [on, v]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], [colors.toggleTrack, colors.toggleTrackOn]),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: v.value * 12 }],
    backgroundColor: interpolateColor(v.value, [0, 1], [colors.send, colors.text]),
  }));

  return (
    <Animated.View style={[styles.toggleTrack, track]}>
      <Animated.View style={[styles.toggleKnob, knob]} />
    </Animated.View>
  );
}

type ComposerProps = {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  pro: boolean;
  onTogglePro: () => void;
  onPlus: () => void;
  onVoice: () => void;
  /** Available width of the composer card, needed to size the hatch texture. */
  width: number;
  disabled?: boolean;
};

export function Composer({
  value,
  onChangeText,
  onSend,
  pro,
  onTogglePro,
  onPlus,
  onVoice,
  width,
  disabled,
}: ComposerProps) {
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);
  const sendPress = useSharedValue(0);

  useEffect(() => {
    focus.value = withTiming(focused ? 1 : 0, { duration: 220 });
  }, [focused, focus]);

  const canSend = value.trim().length > 0 && !disabled;
  const ready = useSharedValue(0);

  useEffect(() => {
    ready.value = glide(canSend ? 1 : 0, 220);
  }, [canSend, ready]);

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [colors.composerBorder, colors.focusBorder]),
    transform: [{ translateY: -focus.value * 2 }],
  }));

  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: (1 - sendPress.value * 0.12) * (0.94 + ready.value * 0.06) }],
    opacity: 1,
  }));

  const handleSend = () => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSend();
  };

  const handleTogglePro = () => {
    Haptics.selectionAsync().catch(() => {});
    onTogglePro();
  };

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      {/* Top row: input + send */}
      <View style={styles.topRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="How can EDITH help you today?"
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.text}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          multiline={false}
          accessibilityLabel="Message EDITH"
        />
        <Pressable
          onPressIn={() => (sendPress.value = tap(1, 110))}
          onPressOut={() => (sendPress.value = tap(0))}
          onPress={handleSend}
          disabled={!canSend}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Send"
        >
          <Animated.View style={[styles.send, sendStyle]}>
            <ArrowUpIcon />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.rowDivider} />

      {/* Bottom row: hatch texture + controls */}
      <View style={styles.bottomRow}>
        <View style={StyleSheet.absoluteFill}>
          <Hatch width={width} height={TOOL_ROW} pitch={9.3} stripeWidth={4.4} drift={9} />
        </View>

        <Pressable onPress={onPlus} hitSlop={6} accessibilityLabel="Add attachment" accessibilityRole="button">
          <View style={styles.round33}>
            <PlusIcon />
          </View>
        </Pressable>

        <Pressable onPress={handleTogglePro} accessibilityRole="switch" accessibilityState={{ checked: pro }}>
          <View style={[styles.proPill, pro && styles.proPillOn]}>
            <Text style={styles.proText}>Pro Search</Text>
            <ProToggle on={pro} />
          </View>
        </Pressable>

        <Pressable onPress={onVoice} hitSlop={6} accessibilityLabel="Voice input" accessibilityRole="button">
          <View style={styles.round33}>
            <WaveformIcon />
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.gutter,
    borderRadius: layout.composerRadius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    overflow: 'hidden',
    ...surfaceShadow,
  },
  topRow: { height: INPUT_ROW, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: 12 },
  rowDivider: { height: 1, backgroundColor: colors.divider },
  input: {
    flex: 1,
    color: colors.text,
    ...type.label,
    padding: 0,
    marginRight: 10,
    ...Platform.select({ android: { paddingVertical: 0, textAlignVertical: 'center' } }),
  },
  send: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: colors.send,
    borderWidth: 1,
    borderColor: colors.sendBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    height: TOOL_ROW,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    gap: 12,
  },
  round33: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pill,
    ...controlStroke,
  },
  proPill: {
    height: 33,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.pill,
    ...controlStroke,
  },
  proPillOn: { backgroundColor: colors.pillActive },
  proText: { ...type.label, color: colors.text },
  toggleTrack: { width: 24, height: 12, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 1 },
  toggleKnob: { width: 10, height: 10, borderRadius: 5 },
});
