import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, type } from '../theme';

const BARS = 26;
const LISTEN_MS = 2600;

function Bar({ index }: { index: number }) {
  const v = useSharedValue(0.15);

  useEffect(() => {
    // Each bar runs its own loop at a slightly different rate so the waveform
    // never looks like a synchronised equaliser.
    const duration = 260 + ((index * 53) % 240);
    v.value = withDelay(
      (index * 37) % 400,
      withRepeat(
        withSequence(
          withTiming(0.35 + ((index * 17) % 65) / 100, { duration, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.12, { duration, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [index, v]);

  const style = useAnimatedStyle(() => ({ height: `${v.value * 100}%` }));

  return <Animated.View style={[styles.bar, style]} />;
}

/**
 * Simulated voice capture. Nothing is recorded — after a beat it drops a
 * transcript into the composer, which is enough to demo the interaction.
 */
export function VoiceOverlay({ onCancel, onTranscript }: { onCancel: () => void; onTranscript: (t: string) => void }) {
  useEffect(() => {
    const id = setTimeout(() => onTranscript('What is UI/UX'), LISTEN_MS);
    return () => clearTimeout(id);
  }, [onTranscript]);

  return (
    <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)} style={styles.wrap}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Cancel voice input" />
      <View style={styles.card}>
        <Text style={styles.label}>Listening…</Text>
        <View style={styles.wave}>
          {Array.from({ length: BARS }, (_, i) => (
            <Bar key={i} index={i} />
          ))}
        </View>
        <Text style={styles.hint}>Simulated voice input — tap anywhere to cancel</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6,6,7,0.94)', alignItems: 'center', justifyContent: 'center' },
  card: { alignItems: 'center', gap: 22, paddingHorizontal: 32 },
  label: { ...type.title, color: colors.text },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 74 },
  bar: { width: 3, borderRadius: 2, backgroundColor: colors.text, minHeight: 3 },
  hint: { ...type.body, color: colors.textMuted, textAlign: 'center' },
});
