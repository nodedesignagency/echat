import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from '../theme';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24' });

export function HistoryIcon({ size = 15, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)} fill="none">
      <Path
        d="M3.2 9.2A9 9 0 1 1 3 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M3 4.5v4.8h4.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 7.4V12l3.1 1.9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ComposeIcon({ size = 15, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)} fill="none">
      <Path
        d="M11 4H5.6A1.6 1.6 0 0 0 4 5.6v12.8A1.6 1.6 0 0 0 5.6 20h12.8a1.6 1.6 0 0 0 1.6-1.6V13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.6 3.4a1.98 1.98 0 0 1 2.8 2.8L12.6 14l-3.5.7.7-3.5 7.8-7.8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SettingsIcon({ size = 17, color = colors.text, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size)} fill="none">
      <Circle cx={12} cy={12} r={3.1} stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M19.4 14.6a1.5 1.5 0 0 0 .3 1.65l.06.06a1.82 1.82 0 1 1-2.58 2.58l-.06-.06a1.5 1.5 0 0 0-1.65-.3 1.5 1.5 0 0 0-.91 1.37v.17a1.82 1.82 0 1 1-3.64 0v-.09a1.5 1.5 0 0 0-.98-1.37 1.5 1.5 0 0 0-1.65.3l-.06.06A1.82 1.82 0 1 1 4.65 16.4l.06-.06a1.5 1.5 0 0 0 .3-1.65 1.5 1.5 0 0 0-1.37-.91h-.17a1.82 1.82 0 1 1 0-3.64h.09a1.5 1.5 0 0 0 1.37-.98 1.5 1.5 0 0 0-.3-1.65l-.06-.06A1.82 1.82 0 1 1 7.15 4.87l.06.06a1.5 1.5 0 0 0 1.65.3h.07a1.5 1.5 0 0 0 .91-1.37v-.17a1.82 1.82 0 1 1 3.64 0v.09a1.5 1.5 0 0 0 .91 1.37 1.5 1.5 0 0 0 1.65-.3l.06-.06a1.82 1.82 0 1 1 2.58 2.58l-.06.06a1.5 1.5 0 0 0-.3 1.65v.07a1.5 1.5 0 0 0 1.37.91h.17a1.82 1.82 0 1 1 0 3.64h-.09a1.5 1.5 0 0 0-1.37.91Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 18, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)} fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function ArrowUpIcon({ size = 17, color = colors.accentInk, strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg {...base(size)} fill="none">
      <Path d="M12 19V5.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M6 11.5 12 5.4l6 6.1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronIcon({ size = 12, color = colors.text, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size * 0.5} viewBox="0 0 12 6" fill="none">
      <Path d="M1 1l5 4 5-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Stacked up/down chevrons beside the ECHAT wordmark (9x14 in the design). */
export function SelectorIcon({ size = 9, color = colors.text, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size * (14 / 9)} viewBox="0 0 9 14" fill="none">
      <Path d="M1 5.2 4.5 1.7 8 5.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1 8.8 4.5 12.3 8 8.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckIcon({ size = 12, color = colors.accentInk, strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M2.5 7.4 5.6 10.5 11.5 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LinkIcon({ size = 12, color = colors.textMuted, strokeWidth = 1.6 }: IconProps) {
  return (
    <Svg {...base(size)} fill="none">
      <Path
        d="M10 13.6a4 4 0 0 0 6 .5l2.4-2.4a4 4 0 0 0-5.7-5.7L11.4 7.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M14 10.4a4 4 0 0 0-6-.5L5.6 12.3a4 4 0 0 0 5.7 5.7l1.3-1.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** The five research-step glyphs, matching the Figma timeline order. */
export function StepIcon({ index, size = 14, color = colors.text }: { index: number; size?: number; color?: string }) {
  const sw = 1.6;
  switch (index) {
    case 0: // collect resources — magnifier
      return (
        <Svg {...base(size)} fill="none">
          <Circle cx={10.6} cy={10.6} r={6.1} stroke={color} strokeWidth={sw} />
          <Path d="M15.2 15.2 20 20" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case 1: // analyse — bar chart
      return (
        <Svg {...base(size)} fill="none">
          <Path d="M5 19V11M12 19V5M19 19v-5" stroke={color} strokeWidth={sw + 0.3} strokeLinecap="round" />
        </Svg>
      );
    case 2: // synthesize — nodes
      return (
        <Svg {...base(size)} fill="none">
          <Circle cx={6} cy={7} r={2.4} stroke={color} strokeWidth={sw} />
          <Circle cx={18} cy={7} r={2.4} stroke={color} strokeWidth={sw} />
          <Circle cx={12} cy={18} r={2.4} stroke={color} strokeWidth={sw} />
          <Path d="M8.4 7h7.2M7.2 9.2l3.6 6.6M16.8 9.2l-3.6 6.6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case 3: // document — page
      return (
        <Svg {...base(size)} fill="none">
          <Path
            d="M6 3.8h7.2L18 8.6V20a.8.8 0 0 1-.8.8H6a.8.8 0 0 1-.8-.8V4.6A.8.8 0 0 1 6 3.8Z"
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <Path d="M13 4v5h5M8.4 13h7M8.4 16.4h4.6" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default: // compile — stack
      return (
        <Svg {...base(size)} fill="none">
          <Path d="M12 3.6 21 8l-9 4.4L3 8l9-4.4Z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M3 12.4 12 16.8l9-4.4M3 16.6 12 21l9-4.4" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
  }
}

/** Static waveform glyph used by the voice button. */
export function WaveformIcon({ size = 17, color = colors.text }: IconProps) {
  const bars = [5, 10, 16, 11, 6];
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <G>
        {bars.map((h, i) => (
          <Rect key={i} x={2 + i * 4} y={10 - h / 2} width={2} height={h} rx={1} fill={color} />
        ))}
      </G>
    </Svg>
  );
}
