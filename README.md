# ECHAT

A React Native (Expo) build of the ECHAT AI assistant screens from Figma, as a
runnable MVP you can open in Expo Go.

The Figma file contains five frames, but they are really five **states of one
screen**. This app implements them as a single live screen driven by a state
machine, rather than five static mockups:

| Figma frame | State in the app |
| --- | --- |
| `Main` | Empty state — pinwheel, tagline, composer |
| `Chat` | Quick answer — user bubble, thinking dots, streamed reply |
| `Pro Search` (1) | Research running — progress bar, live activity timeline |
| `Pro Search` (2) | Completed — collapsed panel, streamed report |
| `Pro Search` (3) | Resources — expanded panel with source cards |

## Running it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS or Android). `npm run web` also works if
you just want to look at it in a browser.

## Try this

1. Type a question and send — you get a quick conversational answer.
2. Turn on **Pro Search**, ask something like *What is UI/UX*, and watch it run
   the five research steps, then stream a full report.
3. Tap the panel header to expand it, and switch to **Resources** for sources.
4. `+` offers prompt starters, the waveform button runs a simulated voice
   capture, and the header icons open history, model and settings.

## How answers are generated

Everything is generated **locally** — there is no network call and no API key.
`src/engine/mock.ts` holds a small topic library (the UI/UX entry reproduces
the copy from the Figma file verbatim) plus templates that fold the user's own
question into a research plan, a source list and a multi-section report. Any
question produces a plausible answer, so the demo never dead-ends.

Swapping in a real model later means replacing `answerFor()` with an API call
that returns the same `Answer` shape; nothing in the UI needs to change.

## Motion

The design is static; the app is not. Motion is built with Reanimated on the UI
thread:

- Pinwheel rotates slowly at rest and spins up while EDITH is working
- Composer lifts and its border brightens on focus; the send button springs
  awake once there is text
- Diagonal hatch texture behind the composer toolbar drifts continuously, and
  the same barber-pole stripes fill the progress bar
- User messages spring in from the right; thinking dots pulse in sequence
- Answers stream character by character with a trailing caret
- Research steps reveal in turn, the connector rail draws downward as each one
  finishes, the active step pulses and completed steps pop into a check
- Panel height animates between its live, collapsed and expanded modes, and the
  tab indicator slides between measured tab positions
- Sheets slide up over a fading backdrop; the voice overlay runs 26 independent
  waveform bars

## Structure

```
App.tsx                      font loading + providers
src/theme.ts                 colours, type scale, spacing (sampled from Figma)
src/engine/mock.ts           local answer engine
src/screens/ChatScreen.tsx   state machine for the whole flow
src/components/
  Logo.tsx                   pinwheel, traced from the Figma artwork
  Hatch.tsx                  drifting diagonal stripe texture
  Composer.tsx               input, send, Pro Search toggle, + and voice
  TopBar.tsx                 history / new chat / title / settings
  Message.tsx                user bubble, assistant avatar, thinking dots
  ProgressStripe.tsx         striped progress bar + percentage
  ResearchPanel.tsx          tabs, activity timeline, source cards
  ReportView.tsx             streamed multi-block report
  StreamingText.tsx          progressive text reveal
  Sheet.tsx / VoiceOverlay.tsx  overlays
```

## Design tokens

`src/theme.ts` is the single source of truth — no component contains a colour
literal. Values were sampled pixel-by-pixel from the exported Figma frame, and
each token is commented `measured` or `derived`:

| Token | Value | Where it came from |
| --- | --- | --- |
| `bg` | `#0B0B0D` | measured — 84% of the frame |
| `surface` | `#0E0E10` | measured — composer / panel fill |
| `surfaceBorder` | `#1C1C1E` | measured — 1px stroke around surfaces |
| `divider` | `#2D2D2F` | measured — rule between composer rows |
| `pill` | `#292929` | measured — every control fill |
| `controlBorderTop/·/Bottom` | `#444248` / `#37363B` / `#2B2A2F` | measured — the bevelled control stroke |
| `send` / `sendBorder` | `#CECECE` / `#EBEBEB` | measured |
| `placeholder` | `#3E3E40` | measured |
| `hatch` | `+4 levels`, 9.3px pitch, 4.4px stripe | measured |

Two details that are easy to miss and were checked explicitly:

- **Controls carry a top-lit bevel.** The 1px stroke is lightest on the top
  edge and darkest on the bottom. React Native honours per-side border
  colours, so `controlStroke` in the theme reproduces it exactly.
- **Raised surfaces cast a downward shadow.** Measured as a ~12px falloff
  below the composer with no spread above it, applied as `surfaceShadow`.

Type sizes were calibrated rather than guessed: Inter was measured against the
text-node widths recorded in the Figma file, so `"Edith is thinking..."` comes
out at 119px as it does in the design. Wrapped copy was matched by line break —
the report body is 12/18 because 8 lines fill the 144-tall frame in the file.

Panel internals (tab group background, timeline rail, progress fill) are marked
`derived`: no render of those regions could be sampled, so the values are
inferred from the measured palette rather than read off the design.

## Notes

- The composer is 369x114 at a 12px gutter — 1px stroke, 56px input row, 1px
  rule, 55px toolbar row, 1px stroke — matching the file exactly.
- The logo is a traced vector of the original artwork (four blades at 90-degree
  steps plus the centre sparkle), not an approximation.
- Attachments are the one control that is presentational — the `+` sheet offers
  prompt starters instead, and says so.
