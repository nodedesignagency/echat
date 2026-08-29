import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Composer } from '../components/Composer';
import { ProgressPercent, ProgressStripe } from '../components/ProgressStripe';
import { ReportView } from '../components/ReportView';
import { ResearchPanel, type PanelMode, type StepState, type Tab } from '../components/ResearchPanel';
import { Sheet, SheetRow, Switch } from '../components/Sheet';
import { SpinningLogo } from '../components/Logo';
import { StreamingText } from '../components/StreamingText';
import { AssistantAvatar, StatusLine, UserBubble } from '../components/Message';
import { TopBar } from '../components/TopBar';
import { VoiceOverlay } from '../components/VoiceOverlay';
import { answerFor, SUGGESTIONS, type Answer } from '../engine/mock';
import { colors, controlStroke, layout, type } from '../theme';

/** How long each Pro Search step takes to "run". */
const STEP_MS = 2200;
const THINK_MS = 1300;

type Turn = {
  id: string;
  question: string;
  pro: boolean;
  answer: Answer;
  status: 'thinking' | 'researching' | 'writing' | 'done';
  stepStates: StepState[];
  progress: number;
  tab: Tab;
  panel: PanelMode;
};

type Overlay = null | 'history' | 'settings' | 'plus' | 'voice' | 'model';

type Archived = { id: string; title: string; turns: Turn[]; at: number };

const MODELS = [
  { id: 'fast', name: 'ECHAT Fast', hint: 'Snappy answers for everyday questions' },
  { id: 'pro', name: 'ECHAT Pro', hint: 'Deeper reasoning, better long-form writing' },
  { id: 'edith', name: 'EDITH Reasoning', hint: 'Shows its working, best with Pro Search' },
];

export function ChatScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const composerWidth = width - layout.gutter * 2;

  const [input, setInput] = useState('');
  const [pro, setPro] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [archive, setArchive] = useState<Archived[]>([]);
  const [model, setModel] = useState(MODELS[2]);
  const [prefs, setPrefs] = useState({ proByDefault: false, haptics: true });

  const scroller = useRef<ScrollView>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Offsets of each turn and of its research panel, so expanding the panel can
  // bring it back into view instead of leaving it above the scroll position.
  const turnY = useRef<Record<string, number>>({});
  const panelY = useRef<Record<string, number>>({});

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const patch = useCallback((id: string, fn: (t: Turn) => Partial<Turn>) => {
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, ...fn(t) } : t)));
  }, []);

  const busy = turns.some((t) => t.status === 'thinking' || t.status === 'researching' || t.status === 'writing');

  const scrollToPanel = useCallback((id: string) => {
    const y = (turnY.current[id] ?? 0) + (panelY.current[id] ?? 0);
    scroller.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
  }, []);

  const send = useCallback(
    (raw?: string) => {
      const question = (raw ?? input).trim();
      if (!question) return;

      const answer = answerFor(question);
      const id = `${Date.now()}`;
      const stepCount = answer.steps.length;

      const turn: Turn = {
        id,
        question,
        pro,
        answer,
        status: pro ? 'researching' : 'thinking',
        stepStates: answer.steps.map((_, i) => (pro && i === 0 ? 'active' : 'pending')),
        progress: pro ? 1 / stepCount : 0,
        tab: 'activity',
        panel: pro ? 'live' : 'collapsed',
      };

      setTurns((prev) => [...prev, turn]);
      setInput('');

      if (!pro) {
        later(THINK_MS, () => patch(id, () => ({ status: 'writing' })));
        return;
      }

      for (let i = 0; i < stepCount; i += 1) {
        later(STEP_MS * (i + 1), () =>
          patch(id, (t) => ({
            stepStates: t.stepStates.map((_, j) => (j <= i ? 'done' : j === i + 1 ? 'active' : 'pending')),
            progress: Math.min(1, (i + 2) / stepCount),
          })),
        );
      }

      later(STEP_MS * stepCount + 420, () => {
        if (prefs.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        patch(id, () => ({ status: 'writing', panel: 'collapsed', progress: 1 }));
      });
    },
    [input, pro, later, patch, prefs.haptics],
  );

  const newChat = useCallback(() => {
    clearTimers();
    setTurns((prev) => {
      if (prev.length) {
        setArchive((a) => [{ id: prev[0].id, title: prev[0].question, turns: prev, at: Date.now() }, ...a].slice(0, 12));
      }
      return [];
    });
    setInput('');
    setPro(prefs.proByDefault);
    setOverlay(null);
  }, [clearTimers, prefs.proByDefault]);

  const restore = useCallback(
    (item: Archived) => {
      clearTimers();
      // Restored turns are already finished, so nothing needs to re-animate.
      setTurns(item.turns.map((t) => ({ ...t, status: 'done', panel: 'collapsed' })));
      setOverlay(null);
    },
    [clearTimers],
  );

  const empty = turns.length === 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar
        busy={busy}
        onHistory={() => setOverlay('history')}
        onNewChat={newChat}
        onSettings={() => setOverlay('settings')}
        onTitle={() => setOverlay('model')}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}
      >
        {empty ? (
          <View style={styles.empty}>
            <Animated.View entering={FadeIn.duration(700)}>
              <SpinningLogo size={64} mode="idle" />
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(180).duration(600)} style={styles.tagline}>
              Every Day I&apos;m Theoretically Human
            </Animated.Text>
            <Animated.View entering={FadeInDown.delay(340).duration(600)} style={styles.chips}>
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <Text key={s} onPress={() => send(s)} style={styles.chip}>
                  {s}
                </Text>
              ))}
            </Animated.View>
          </View>
        ) : (
          <ScrollView
            ref={scroller}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            onContentSizeChange={() => {
              if (busy) scroller.current?.scrollToEnd({ animated: true });
            }}
          >
            {turns.map((turn, index) => (
              <View
                key={turn.id}
                style={index === 0 ? styles.firstTurn : styles.turn}
                onLayout={(e) => {
                  turnY.current[turn.id] = e.nativeEvent.layout.y;
                }}
              >
                <UserBubble text={turn.question} />

                {turn.pro ? (
                  <ProTurn
                    turn={turn}
                    width={composerWidth}
                    onLayoutPanel={(y) => {
                      panelY.current[turn.id] = y;
                    }}
                    onPanel={(panel) => {
                      patch(turn.id, () => ({ panel }));
                      if (panel === 'expanded') scrollToPanel(turn.id);
                    }}
                    onTab={(tab) => {
                      patch(turn.id, (t) => ({ tab, panel: t.panel === 'collapsed' ? 'expanded' : t.panel }));
                      scrollToPanel(turn.id);
                    }}
                    onReportDone={() => patch(turn.id, () => ({ status: 'done' }))}
                  />
                ) : (
                  <QuickTurn turn={turn} onDone={() => patch(turn.id, () => ({ status: 'done' }))} />
                )}
              </View>
            ))}
          </ScrollView>
        )}

        <Composer
          value={input}
          onChangeText={setInput}
          onSend={() => send()}
          pro={pro}
          onTogglePro={() => setPro((p) => !p)}
          onPlus={() => setOverlay('plus')}
          onVoice={() => setOverlay('voice')}
          width={composerWidth}
        />
        <View style={{ height: Math.max(insets.bottom, 12) }} />
      </KeyboardAvoidingView>

      {overlay === 'history' && (
        <Sheet
          title="Chat history"
          subtitle={archive.length ? undefined : 'Chats you start a new session from will show up here.'}
          onClose={() => setOverlay(null)}
        >
          {archive.map((item) => (
            <SheetRow
              key={item.id}
              label={item.title}
              hint={`${item.turns.length} message${item.turns.length === 1 ? '' : 's'}`}
              onPress={() => restore(item)}
            />
          ))}
        </Sheet>
      )}

      {overlay === 'settings' && (
        <Sheet title="Settings" onClose={() => setOverlay(null)}>
          <SheetRow
            label="Pro Search by default"
            hint="Start every new chat in research mode"
            right={<Switch on={prefs.proByDefault} />}
            onPress={() => setPrefs((p) => ({ ...p, proByDefault: !p.proByDefault }))}
          />
          <SheetRow
            label="Haptics"
            hint="Feedback when sending and when research completes"
            right={<Switch on={prefs.haptics} />}
            onPress={() => setPrefs((p) => ({ ...p, haptics: !p.haptics }))}
          />
          <SheetRow label="Model" hint={model.name} onPress={() => setOverlay('model')} />
          <SheetRow
            label="About this build"
            hint="MVP demo — answers are generated locally, no network calls."
            disabled
          />
        </Sheet>
      )}

      {overlay === 'model' && (
        <Sheet title="Model" subtitle="Pick how EDITH answers" onClose={() => setOverlay(null)}>
          {MODELS.map((m) => (
            <SheetRow
              key={m.id}
              label={m.name}
              hint={m.hint}
              right={m.id === model.id ? <Text style={styles.tick}>✓</Text> : null}
              onPress={() => {
                setModel(m);
                setOverlay(null);
              }}
            />
          ))}
        </Sheet>
      )}

      {overlay === 'plus' && (
        <Sheet
          title="Add to your message"
          subtitle="Attachments aren't wired up in this demo — try a starter instead."
          onClose={() => setOverlay(null)}
        >
          {SUGGESTIONS.map((s) => (
            <SheetRow
              key={s}
              label={s}
              onPress={() => {
                setInput(s);
                setOverlay(null);
              }}
            />
          ))}
        </Sheet>
      )}

      {overlay === 'voice' && (
        <VoiceOverlay
          onCancel={() => setOverlay(null)}
          onTranscript={(t) => {
            setInput(t);
            setOverlay(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

/* --------------------------- turn renderers --------------------------- */

function QuickTurn({ turn, onDone }: { turn: Turn; onDone: () => void }) {
  const thinking = turn.status === 'thinking';

  return (
    <View>
      <View style={styles.avatarSlot}>
        <AssistantAvatar thinking={thinking} />
      </View>
      <StatusLine text={thinking ? 'EDITH is thinking…' : turn.answer.label} dim={!thinking} />
      {!thinking && (
        <Animated.View entering={FadeIn.duration(240)} style={styles.answerWrap}>
          <StreamingText
            text={turn.answer.quick}
            style={styles.answerText}
            enabled={turn.status === 'writing'}
            chunk={3}
            tick={24}
            onDone={onDone}
          />
        </Animated.View>
      )}
    </View>
  );
}

function ProTurn({
  turn,
  width,
  onPanel,
  onTab,
  onReportDone,
  onLayoutPanel,
}: {
  turn: Turn;
  width: number;
  onPanel: (m: PanelMode) => void;
  onTab: (t: Tab) => void;
  onReportDone: () => void;
  onLayoutPanel: (y: number) => void;
}) {
  const researching = turn.status === 'researching';

  return (
    <View>
      {researching && (
        <Animated.View exiting={FadeOut.duration(200)}>
          <View style={styles.avatarSlot}>
            <AssistantAvatar thinking />
          </View>
          <View style={styles.statusRow}>
            <StatusLine text="Edith is thinking…" />
            <View style={styles.percentWrap}>
              <ProgressPercent target={turn.progress} />
            </View>
          </View>
          <View style={styles.progressWrap}>
            <ProgressStripe progress={turn.progress} width={width} duration={STEP_MS} />
          </View>
        </Animated.View>
      )}

      <View
        style={researching ? styles.panelWrapLive : styles.panelWrap}
        onLayout={(e) => onLayoutPanel(e.nativeEvent.layout.y)}
      >
        <ResearchPanel
          title={researching ? 'Pro Search' : 'Completed'}
          mode={turn.panel}
          onToggle={() => onPanel(turn.panel === 'collapsed' ? 'expanded' : 'collapsed')}
          steps={turn.answer.steps.map((text, i) => ({ text, state: turn.stepStates[i] }))}
          sources={turn.answer.sources}
          tab={turn.tab}
          onTab={onTab}
        />
      </View>

      {!researching && (
        <ReportView blocks={turn.answer.report} stream={turn.status === 'writing'} onComplete={onReportDone} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingBottom: 60 },
  tagline: { ...type.tagline, color: colors.text, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 32, marginTop: 6 },
  chip: {
    ...type.body,
    color: colors.textMuted,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    overflow: 'hidden',
    ...controlStroke,
  },
  scrollContent: { paddingBottom: 24 },
  firstTurn: { paddingTop: 40 },
  turn: { paddingTop: 28 },
  avatarSlot: { marginTop: 24 },
  statusRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: layout.gutter,
  },
  percentWrap: { paddingLeft: 8 },
  progressWrap: { marginTop: 12, paddingHorizontal: layout.gutter },
  panelWrapLive: { marginTop: 16 },
  panelWrap: { marginTop: 24 },
  answerWrap: { marginTop: 16, paddingHorizontal: layout.gutter },
  answerText: { ...type.bodyLoose, color: colors.text },
  tick: { ...type.title, color: colors.text },
});
