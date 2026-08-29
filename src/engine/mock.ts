/**
 * Simulated ECHAT engine.
 *
 * Everything is generated locally: no network, no API key, works offline in
 * Expo Go. Answers are assembled from a small topic library plus templates
 * that fold the user's own question back into the response, so arbitrary
 * questions still produce something that reads like a real research report.
 */

export type Source = { title: string; domain: string };

export type ReportBlock =
  | { kind: 'title'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string };

export type Answer = {
  /** Short label shown above a quick (non-Pro) reply. */
  label: string;
  /** The quick chat reply. */
  quick: string;
  /** Pro Search plan — five steps, matching the Figma timeline. */
  steps: string[];
  sources: Source[];
  report: ReportBlock[];
};

const GREETING = /^(hi|hey|hello|yo|sup|wassup|what'?s up|howdy|good (morning|evening|afternoon))\b/i;
const SMALLTALK = /\b(how are you|who are you|what can you do|your name)\b/i;

/** Question shapes where the subject is not simply the tail of the sentence. */
const SHAPES: RegExp[] = [
  /^how (?:does|do|did) (.+?)(?: actually)? work\b/i,
  /^how (?:to|do i|can i|would i) (.+)$/i,
  /^(?:what|who|which) (?:is|are|was|were) (?:a |an |the )?(.+)$/i,
  /^(?:tell me|explain|describe|summari[sz]e)(?: me)?(?: about)? (?:a |an |the )?(.+)$/i,
  /^why (?:is|are|does|do) (.+)$/i,
];

/** Pull the subject out of a question so templates can talk about it. */
function topicOf(question: string): string {
  const trimmed = question.trim().replace(/[?!.]+$/g, '');
  for (const shape of SHAPES) {
    const m = shape.exec(trimmed);
    const hit = m?.[1]?.trim().replace(/^(?:a|an|the)\s+/i, '');
    if (hit && hit.length > 1) return hit;
  }

  const cleaned = question
    .trim()
    .replace(/[?!.]+$/g, '')
    .replace(/^(what|who|why|how|when|where|which|can you|could you|tell me|explain|give me)\b/i, '')
    .replace(/^\s*(is|are|was|were|do|does|did|about|me)\b/i, '')
    .replace(/^\s*(a|an|the)\b/i, '')
    .trim();
  return cleaned.length > 1 ? cleaned : question.trim().replace(/[?!.]+$/g, '');
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ *
 * Topic library. The UI/UX entry is the verbatim copy from the Figma
 * file so the reference screens reproduce exactly.
 * ------------------------------------------------------------------ */

const UIUX: Answer = {
  label: 'Design Research',
  quick:
    'UI is what the product looks like, UX is how it feels to use. Want me to run a Pro Search and put together a proper report on it?',
  steps: [
    'Identify and collect relevant resources, such as articles, books, and online courses related to UI/UX design and its foundational ideas',
    'Analyze the gathered information by summarizing key concepts, definitions, and examples of UI/UX',
    'Synthesize insights and trends by comparing different perspectives and frameworks in UI/UX design',
    'Document findings and create a cohesive overview that highlights the importance and principle of UI/UX',
    'Compile research result',
  ],
  sources: [
    { title: 'What are some good books for learning UI & UX design? What about online courses, which one should we prefer?', domain: 'quora.com' },
    { title: 'The Definition of User Experience (UX) — foundations, scope and common misconceptions', domain: 'nngroup.com' },
    { title: 'UI vs UX design: what is the actual difference between the two disciplines?', domain: 'interaction-design.org' },
    { title: 'Material Design 3 — foundations of usable, accessible and adaptive interfaces', domain: 'm3.material.io' },
    { title: 'Human Interface Guidelines: designing for clarity, deference and depth', domain: 'developer.apple.com' },
    { title: '10 Usability Heuristics for User Interface Design, revisited for modern products', domain: 'nngroup.com' },
    { title: 'The 2025 state of UX research: methods teams actually use', domain: 'uxdesign.cc' },
    { title: 'Inclusive design principles and how accessibility improves outcomes for everyone', domain: 'smashingmagazine.com' },
  ],
  report: [
    { kind: 'title', text: 'UI/UX Design: A Comprehensive Overview of Principles, Trends, and Best Practices' },
    {
      kind: 'paragraph',
      text: 'UI/UX design has become an essential aspect of creating engaging and effective digital experiences that meet the needs of users. The study of UI/UX involves understanding user behavior, psychology, and emotions to design intuitive and efficient interfaces that maximize user satisfaction and retention. In this detailed report, we will explore the fundamental principles, trends, and best practices of UI/UX design, highlighting key learnings and insights from research.',
    },
    { kind: 'heading', text: 'Foundational Principles of UI/UX Design' },
    {
      kind: 'paragraph',
      text: 'UI/UX design revolves around understanding user needs and creating solutions that cater to those needs. At its core, UI/UX design emphasizes principles like empathy, strategy, usability, inclusivity, and validation to ensure that user experiences are intuitive and efficient. Empathy, in particular, is a crucial aspect of UI/UX design, as it involves understanding users’ thoughts, behaviors, and motivations to create solutions that meet their needs.',
    },
    { kind: 'heading', text: 'Trends Shaping the Discipline' },
    {
      kind: 'paragraph',
      text: 'Contemporary practice has shifted from static screen design toward systems thinking: design tokens, component libraries, and motion specifications that let a product stay coherent across platforms. Accessibility has moved from a late-stage audit to a first-class constraint, and teams increasingly validate with lightweight, continuous research rather than a single large study at the end of a cycle.',
    },
    { kind: 'heading', text: 'What Good Practice Looks Like' },
    {
      kind: 'paragraph',
      text: 'Strong teams reduce the distance between a decision and evidence for it. That means writing the problem statement before the interface, prototyping at the lowest fidelity that can answer the question, instrumenting flows so that real usage informs the next iteration, and treating performance and clarity as design properties rather than engineering afterthoughts.',
    },
  ],
};

const LIBRARY: { match: RegExp; answer: Answer }[] = [
  { match: /\b(ui\s*\/?\s*ux|ux\s*\/?\s*ui|user experience|user interface|product design)\b/i, answer: UIUX },
];

/* ------------------------------------------------------------------ *
 * Generic generation for anything outside the library.
 * ------------------------------------------------------------------ */

function genericAnswer(question: string): Answer {
  const topic = topicOf(question);
  const Topic = titleCase(topic);

  return {
    label: 'General Research',
    quick: `Short version: ${topic} is best understood by looking at what problem it solves, how it actually works in practice, and where it tends to break down. Turn on Pro Search and I'll dig into it properly.`,
    steps: [
      `Identify and collect relevant resources, such as articles, papers, and primary documentation covering ${topic}`,
      `Analyze the gathered information by summarizing key concepts, definitions, and concrete examples of ${topic}`,
      `Synthesize insights and trends by comparing different perspectives and frameworks around ${topic}`,
      `Document findings and create a cohesive overview that highlights the importance and principles of ${topic}`,
      'Compile research result',
    ],
    sources: [
      { title: `An introduction to ${topic}: what it is, why it exists, and who it is for`, domain: 'wikipedia.org' },
      { title: `${Topic} explained — a practitioner's walkthrough with worked examples`, domain: 'medium.com' },
      { title: `Common misconceptions about ${topic} and what the evidence actually says`, domain: 'arxiv.org' },
      { title: `Discussion: how do people apply ${topic} in real projects?`, domain: 'quora.com' },
      { title: `${Topic}: current state, open problems and where the field is heading`, domain: 'nature.com' },
      { title: `A practical guide to getting started with ${topic}`, domain: 'github.com' },
      { title: `Case studies and post-mortems involving ${topic}`, domain: 'stackoverflow.com' },
      { title: `Reference documentation and specifications for ${topic}`, domain: 'developer.mozilla.org' },
    ],
    report: [
      { kind: 'title', text: `${Topic}: An Overview of Principles, Trends, and Practical Takeaways` },
      {
        kind: 'paragraph',
        text: `This report gathers what is currently understood about ${topic} and organises it into a form that is useful for making decisions. Rather than restating definitions, it focuses on the underlying mechanisms, the trade-offs that show up in practice, and the situations where conventional guidance turns out to be misleading.`,
      },
      { kind: 'heading', text: 'Foundations' },
      {
        kind: 'paragraph',
        text: `At its core, ${topic} is easiest to reason about by separating the problem it solves from the specific techniques used to solve it. The problem tends to be stable over time; the techniques change quickly. Sources consistently converge on a small set of first principles, and most disagreement in the literature is about emphasis and context rather than fundamentals.`,
      },
      { kind: 'heading', text: 'Trends and Current Thinking' },
      {
        kind: 'paragraph',
        text: `Recent work around ${topic} has moved toward approaches that are measurable and incremental. Practitioners report better outcomes when they validate assumptions early, keep feedback loops short, and prefer reversible decisions while uncertainty is still high. The clearest failures in the surveyed material come from scaling a solution before the problem was well understood.`,
      },
      { kind: 'heading', text: 'Practical Takeaways' },
      {
        kind: 'paragraph',
        text: `Start from the smallest version of ${topic} that produces a real signal, instrument it so you can tell whether it is working, and expand only where the evidence supports it. Document the reasoning behind decisions, not just the outcomes — that record is what makes the next iteration cheaper.`,
      },
    ],
  };
}

const GREETING_REPLIES = [
  "Not much, just chilling and ready to assist you. What's on your mind today?",
  "Hey! I'm here and ready. What are we digging into?",
  "All good on my end. Ask me anything — flip on Pro Search if you want the deep version.",
];

// Cycle rather than pick at random, so the first greeting always matches the
// copy in the design file and repeats still feel varied.
let greetingTurn = 0;

const SMALLTALK_REPLY =
  "I'm EDITH, the assistant behind ECHAT. Ask me a question and I'll answer straight away — or turn on Pro Search and I'll research it step by step, show you my working, and cite the sources I used.";

/** Resolve a question into a full answer bundle. */
export function answerFor(question: string): Answer {
  const q = question.trim();

  if (GREETING.test(q)) {
    const base = genericAnswer(q);
    return {
      ...base,
      label: 'General Conversation',
      quick: GREETING_REPLIES[greetingTurn++ % GREETING_REPLIES.length],
    };
  }

  if (SMALLTALK.test(q)) {
    const base = genericAnswer(q);
    return { ...base, label: 'General Conversation', quick: SMALLTALK_REPLY };
  }

  for (const entry of LIBRARY) {
    if (entry.match.test(q)) return entry.answer;
  }

  return genericAnswer(q);
}

export const SUGGESTIONS = ['What is UI/UX', 'Wassup', 'Explain vector databases', 'How does a diffusion model work'];
