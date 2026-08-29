import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CheckIcon, ChevronIcon } from './icons';
import { LogoMark } from './Logo';
import { colors, controlStroke, layout, surfaceShadow, type } from '../theme';
import type { Source } from '../engine/mock';

export type StepState = 'pending' | 'active' | 'done';
export type Tab = 'activity' | 'resources';

const HEADER = 55;
const LIVE_BODY = 95;
const STEP_PITCH = 92;
const RAIL_X = 28;

/* ------------------------------ timeline ------------------------------ */

function StepNode({ state }: { state: StepState }) {
  const pulse = useSharedValue(0);
  const pop = useSharedValue(state === 'done' ? 1 : 0);

  useEffect(() => {
    if (state === 'active') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [state, pulse]);

  useEffect(() => {
    pop.value = withSpring(state === 'done' ? 1 : 0, { damping: 12, stiffness: 260 });
  }, [state, pop]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - pulse.value) * 0.45,
    transform: [{ scale: 0.8 + pulse.value * 0.9 }],
  }));

  const doneStyle = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: 0.5 + pop.value * 0.5 }],
  }));

  const glyphStyle = useAnimatedStyle(() => ({
    opacity: 1 - pop.value,
    transform: [{ scale: 1 - pop.value * 0.4 }],
  }));

  return (
    <View style={styles.node}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, glyphStyle]}>
        <View style={[styles.stepDisc, state === 'pending' && styles.stepDiscPending]}>
          <LogoMark size={12} color={state === 'pending' ? colors.textMuted : colors.text} />
        </View>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, doneStyle]}>
        <View style={styles.doneDot}>
          <CheckIcon size={11} />
        </View>
      </Animated.View>
    </View>
  );
}

function Connector({ active, height }: { active: boolean; height: number }) {
  const draw = useSharedValue(0);

  useEffect(() => {
    draw.value = withTiming(active ? 1 : 0, { duration: 700, easing: Easing.inOut(Easing.quad) });
  }, [active, draw]);

  const style = useAnimatedStyle(() => ({ height: draw.value * height }));

  return (
    <View style={[styles.rail, { height }]}>
      <Animated.View style={[styles.railFill, style]} />
    </View>
  );
}

function TimelineStep({
  index,
  text,
  state,
  last,
  onLayout,
}: {
  index: number;
  text: string;
  state: StepState;
  last: boolean;
  onLayout?: (y: number) => void;
}) {
  const reveal = useSharedValue(state === 'pending' ? 0 : 1);

  useEffect(() => {
    reveal.value = withDelay(
      index * 40,
      withTiming(state === 'pending' ? 0.35 : 1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
  }, [state, index, reveal]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + reveal.value * 0.72,
    transform: [{ translateY: (1 - reveal.value) * 6 }],
  }));

  return (
    <View style={[styles.step, last && styles.stepLast]} onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      <View style={styles.gutterCol}>
        <StepNode state={state} />
        {!last && <Connector active={state === 'done'} height={STEP_PITCH - 32} />}
      </View>
      <Animated.Text style={[styles.stepText, textStyle]}>{text}</Animated.Text>
    </View>
  );
}

/* ------------------------------ resources ------------------------------ */

/** Brand colours for the domains the demo cites, with a stable fallback. */
const BRAND: Record<string, string> = {
  'quora.com': '#B92B27',
  'nngroup.com': '#1B4C8C',
  'interaction-design.org': '#0E7C66',
  'm3.material.io': '#4285F4',
  'developer.apple.com': '#4A4A4F',
  'uxdesign.cc': '#A259FF',
  'smashingmagazine.com': '#D33A2C',
  'wikipedia.org': '#3A3A3C',
  'medium.com': '#1A8917',
  'arxiv.org': '#B31B1B',
  'nature.com': '#0B6E4F',
  'github.com': '#3A3A3C',
  'stackoverflow.com': '#F48024',
  'developer.mozilla.org': '#005A9C',
};

function brandColor(domain: string): string {
  if (BRAND[domain]) return BRAND[domain];
  let h = 0;
  for (let i = 0; i < domain.length; i += 1) h = (h * 31 + domain.charCodeAt(i)) % 360;
  return `hsl(${h}, 42%, 42%)`;
}

function SourceCard({ source, index }: { source: Source; index: number }) {
  return (
    <Animated.View entering={FadeIn.delay(index * 80).duration(320)} style={styles.sourceCard}>
      <Text style={styles.sourceTitle} numberOfLines={2}>
        {source.title}
      </Text>
      <View style={styles.sourceRule} />
      <View style={styles.sourceMeta}>
        <View style={[styles.favicon, { backgroundColor: brandColor(source.domain) }]}>
          <Text style={styles.faviconLetter}>{source.domain[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.sourceDomain}>{source.domain}</Text>
      </View>
    </Animated.View>
  );
}

/* -------------------------------- tabs -------------------------------- */

function Tabs({ tab, onChange, count }: { tab: Tab; onChange: (t: Tab) => void; count: number }) {
  // Tab geometry is measured rather than assumed, so the sliding indicator
  // stays aligned whatever the label widths turn out to be.
  const [box, setBox] = useState<Record<Tab, { x: number; w: number }>>({
    activity: { x: 0, w: 0 },
    resources: { x: 0, w: 0 },
  });
  const x = useSharedValue(0);
  const width = useSharedValue(0);

  useEffect(() => {
    const b = box[tab];
    if (!b.w) return;
    const spring = { damping: 18, stiffness: 220 };
    x.value = width.value === 0 ? b.x : withSpring(b.x, spring);
    width.value = width.value === 0 ? b.w : withSpring(b.w, spring);
  }, [tab, box, x, width]);

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: width.value,
    opacity: width.value ? 1 : 0,
  }));

  const measure = (key: Tab) => (e: LayoutChangeEvent) => {
    const { x: nx, width: nw } = e.nativeEvent.layout;
    setBox((prev) =>
      Math.abs(prev[key].x - nx) < 0.5 && Math.abs(prev[key].w - nw) < 0.5
        ? prev
        : { ...prev, [key]: { x: nx, w: nw } },
    );
  };

  return (
    <View style={styles.tabs}>
      <Animated.View style={[styles.tabIndicator, indicator]} />
      <Pressable onPress={() => onChange('activity')} onLayout={measure('activity')} style={styles.tab}>
        <Text style={[styles.tabText, tab === 'activity' && styles.tabTextOn]}>Activity</Text>
      </Pressable>
      <Pressable onPress={() => onChange('resources')} onLayout={measure('resources')} style={styles.tab}>
        <Text style={[styles.tabText, tab === 'resources' && styles.tabTextOn]}>Resources ({count})</Text>
      </Pressable>
    </View>
  );
}

/* -------------------------------- panel -------------------------------- */

export type PanelMode = 'live' | 'collapsed' | 'expanded';

type PanelProps = {
  title: string;
  mode: PanelMode;
  onToggle: () => void;
  steps: { text: string; state: StepState }[];
  sources: Source[];
  tab: Tab;
  onTab: (t: Tab) => void;
};

export function ResearchPanel({ title, mode, onToggle, steps, sources, tab, onTab }: PanelProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const stepY = useRef<number[]>([]);
  const body = useSharedValue(mode === 'live' ? LIVE_BODY : 0);
  const chevron = useSharedValue(mode === 'expanded' ? 1 : 0);
  const scroller = useRef<ScrollView>(null);

  const activeIndex = steps.findIndex((s) => s.state === 'active');

  useEffect(() => {
    const target = mode === 'collapsed' ? 0 : mode === 'live' ? LIVE_BODY : contentHeight;
    body.value = withTiming(target, { duration: 380, easing: Easing.inOut(Easing.cubic) });
    chevron.value = withTiming(mode === 'expanded' ? 1 : 0, { duration: 300 });
  }, [mode, contentHeight, body, chevron]);

  // While researching, keep the running step in view inside the short window.
  useEffect(() => {
    if (mode !== 'live' || activeIndex < 0) return;
    const id = setTimeout(() => {
      const y = stepY.current[activeIndex] ?? activeIndex * STEP_PITCH;
      scroller.current?.scrollTo({ y: Math.max(0, y - 4), animated: true });
    }, 220);
    return () => clearTimeout(id);
  }, [activeIndex, mode]);

  const bodyStyle = useAnimatedStyle(() => ({ height: body.value }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
    opacity: 0.6 + chevron.value * 0.4,
  }));

  const content = (
    <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)} style={styles.content}>
      {tab === 'activity' ? (
        <View style={styles.timeline}>
          {steps.map((s, i) => (
            <TimelineStep
              key={i}
              index={i}
              text={s.text}
              state={s.state}
              last={i === steps.length - 1}
              onLayout={(y) => {
                stepY.current[i] = y;
              }}
            />
          ))}
        </View>
      ) : (
        <View style={styles.sources}>
          {sources.map((s, i) => (
            <SourceCard key={i} source={s} index={i} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.panel}>
      <Pressable onPress={onToggle} style={styles.header} accessibilityRole="button">
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
        <Tabs tab={tab} onChange={onTab} count={sources.length} />
        <Animated.View style={chevronStyle}>
          <ChevronIcon size={12} color={colors.textMuted} />
        </Animated.View>
      </Pressable>

      <View style={styles.divider} />

      <Animated.View style={[styles.body, bodyStyle]}>
        {mode === 'live' ? (
          <ScrollView
            ref={scroller}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.liveScroll}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: layout.gutter,
    borderRadius: layout.panelRadius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    ...surfaceShadow,
  },
  header: { height: HEADER, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  headerTitle: { ...type.label, color: colors.text, flexShrink: 0 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surfaceBorder },
  body: { overflow: 'hidden' },
  liveScroll: { paddingBottom: 8 },
  content: { paddingTop: 16, paddingBottom: 16 },

  headerSpacer: { flex: 1 },
  tabs: {
    height: 39,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 4,
    borderRadius: 16,
    backgroundColor: colors.segment,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  tabIndicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 13,
    backgroundColor: colors.pill,
    ...controlStroke,
  },
  tab: { height: 27, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  tabText: { ...type.small, color: colors.textBody },
  tabTextOn: { color: colors.text },

  timeline: { paddingLeft: 16, paddingRight: 15 },
  step: { flexDirection: 'row', minHeight: STEP_PITCH },
  // The final step has no connector below it, so it should not reserve a full pitch.
  stepLast: { minHeight: 0 },
  gutterCol: { width: 24, alignItems: 'center' },
  node: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  // The design marks every step with the pinwheel inside a thin circle.
  stepDisc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDiscPending: { borderColor: colors.rail },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: colors.ring },
  doneDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.done, alignItems: 'center', justifyContent: 'center' },
  rail: { width: 1.5, borderRadius: 1, backgroundColor: colors.rail, marginTop: 4 },
  railFill: { width: 1.5, borderRadius: 1, backgroundColor: colors.railActive },
  stepText: { ...type.bodyLoose, color: colors.text, flex: 1, marginLeft: 10, marginTop: 1 },

  // Figma: 345-wide cards inside the 369 panel, 102 tall, 12px apart, each a
  // bordered card with a full-bleed rule between title and attribution.
  sources: { paddingHorizontal: 12, gap: 12 },
  sourceCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    paddingTop: 12,
  },
  sourceTitle: { ...type.sourceTitle, color: colors.text, paddingLeft: 12, paddingRight: 11 },
  sourceRule: { height: 1, backgroundColor: colors.surfaceBorder, marginTop: 16 },
  sourceMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10 },
  favicon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  faviconLetter: { fontFamily: type.small.fontFamily, fontSize: 11, lineHeight: 14, color: colors.text },
  sourceDomain: { ...type.domain, color: colors.textBody },
});
