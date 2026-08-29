import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StreamingText } from './StreamingText';
import { colors, layout, type } from '../theme';
import type { ReportBlock } from '../engine/mock';

/**
 * Renders a Pro Search report, streaming one block at a time so the answer
 * builds up the way the Figma "completed" screen implies.
 */
export function ReportView({
  blocks,
  stream,
  onComplete,
}: {
  blocks: ReportBlock[];
  stream: boolean;
  onComplete?: () => void;
}) {
  const [ready, setReady] = useState(stream ? 0 : blocks.length - 1);

  const advance = useCallback(() => {
    setReady((n) => {
      if (n + 1 >= blocks.length) onComplete?.();
      return n + 1;
    });
  }, [blocks.length, onComplete]);

  return (
    <View style={styles.wrap}>
      {blocks.map((block, i) => {
        if (i > ready) return null;
        const isLast = i === ready;
        const style =
          block.kind === 'title' ? styles.title : block.kind === 'heading' ? styles.heading : styles.paragraph;

        return (
          <Animated.View key={i} entering={FadeInDown.duration(320).delay(40)} style={styles.block}>
            <StreamingText
              text={block.text}
              style={style}
              enabled={stream}
              chunk={block.kind === 'paragraph' ? 12 : 4}
              tick={22}
              onDone={isLast ? advance : undefined}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: layout.gutter },
  block: { marginTop: 18 },
  title: { ...type.reportTitle, color: colors.text },
  heading: { ...type.sectionTitle, color: colors.text },
  paragraph: { ...type.bodyLoose, color: colors.text, opacity: 0.88 },
});
