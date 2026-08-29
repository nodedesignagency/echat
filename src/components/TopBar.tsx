import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ChevronIcon, ComposeIcon, HistoryIcon, SettingsIcon } from './icons';
import { LogoMark } from './Logo';
import { colors, layout, motion, type } from '../theme';

/** 32x32 rounded icon button used across the header, with a press-in spring. */
export function IconButton({
  children,
  onPress,
  size = layout.headerIcon,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  accessibilityLabel?: string;
}) {
  const press = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.09 }],
    backgroundColor: press.value > 0.5 ? colors.pillActive : colors.surfaceRaised,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPressIn={() => (press.value = withTiming(1, { duration: 90 }))}
      onPressOut={() => (press.value = withSpring(0, { damping: 14, stiffness: 260 }))}
      onPress={onPress}
    >
      <Animated.View
        style={[
          { width: size, height: size, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type TopBarProps = {
  onHistory: () => void;
  onNewChat: () => void;
  onSettings: () => void;
  onTitle: () => void;
  busy?: boolean;
};

export function TopBar({ onHistory, onNewChat, onSettings, onTitle, busy }: TopBarProps) {
  return (
    <Animated.View entering={FadeInDown.duration(motion.slow)} style={styles.row}>
      <View style={styles.side}>
        <IconButton onPress={onHistory} accessibilityLabel="Chat history">
          <HistoryIcon />
        </IconButton>
        <IconButton onPress={onNewChat} accessibilityLabel="New chat">
          <ComposeIcon />
        </IconButton>
      </View>

      <Pressable onPress={onTitle} hitSlop={10} style={styles.title} accessibilityRole="button">
        <LogoMark size={20} />
        <Text style={styles.titleText}>ECHAT</Text>
        <View style={styles.chevron}>
          <ChevronIcon size={9} color={colors.text} strokeWidth={2} />
        </View>
      </Pressable>

      <View style={styles.side}>
        <IconButton onPress={onSettings} accessibilityLabel="Settings">
          <SettingsIcon />
        </IconButton>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 64,
    paddingHorizontal: layout.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: { flexDirection: 'row', gap: 8, minWidth: 72 },
  title: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleText: { ...type.title, color: colors.text, letterSpacing: 0.4 },
  chevron: { marginLeft: -1, transform: [{ translateY: 1 }] },
});
