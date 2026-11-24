// Make the Judge Smile — entry generator.
//
// Writes one hand-written line about a small good thing that happened
// today to $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt).
// Stdlib only, no network, fully deterministic: the same input always
// produces the same output byte for byte.
//
// How it works: a small set of hand-written candidate lines is ranked by
// a deterministic scorer that mirrors the judge's published brief, in
// the judge's own order of importance:
//   1. on subject — a small good thing that happened today
//   2. warmth — a genuine glow, kindness or luck, felt not reported
//   3. surprise — an unexpected turn, in the event or in the telling
//   4. concreteness — one real small detail (a name, a sound, a time)
//   5. fresh wording — no greeting-card phrasing, no borrowed sentiment
// The best-scoring line is then checked against the gate (exactly one
// line, 1-200 characters, no leading/trailing whitespace) and written
// out, read back, and verified byte for byte.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Candidates — each written by hand for this competition. Every one is a
// single line about one small good thing that happened today.
// ---------------------------------------------------------------------------
const CANDIDATES: string[] = [
  // Time of day + a stranger's unprompted kindness + the odd, warm detail
  // of a wave like an old friend.
  "At 7:40 this morning the elevator doors opened on my floor and a stranger held them, then waved like we'd known each other for years.",

  // Weather luck with a comic twist: a cat escorting me like hired help.
  "The rain stopped the exact minute I stepped outside, and a tabby I'd never met walked me to the bus stop like a bodyguard.",

  // A dawn gift with no sender — warmth in the anonymity, concreteness
  // in the citrus smell and the ribbon.
  "My neighbour left a bag of oranges on my doorstep at dawn — no note, just the smell of citrus and a ribbon tied to the handle.",

  // A bus driver bending the rules a little, with a line of dialogue that
  // turns a wet run into a small ceremony.
  "The bus driver waited while I ran half a block in the rain, then grinned and said the front seats were reserved for heroes.",

  // A child treats a weed like a prize; the adult's reaction is the turn —
  // carried home in both hands, like something the wind might steal.
  "At noon a kid in the park handed me a dandelion like it was a medal, and I carried it home in both hands so the wind couldn't take it.",
];

// ---------------------------------------------------------------------------
// Scorer. Weights follow the judge's published order: warmth first, then
// surprise, then concreteness, then freshness. Subject is guaranteed by
// construction — every candidate is one small good thing from today.
// ---------------------------------------------------------------------------

// Warmth: words that carry a felt glow rather than a report.
const WARM_WORDS = [
  "held", "waved", "grinned", "smell", "ribbon", "gift", "heroes",
  "medal", "home", "neighbour", "stranger", "walked me", "waited",
  "handed me", "carried", "in both hands",
];

// Surprise: markers of an unexpected turn — a twist, a reversal, a
// comparison that reframes the scene.
const SURPRISE_MARKERS = [
  "like a bodyguard", "like it was a medal", "like I owed it something",
  "like we'd known each other", "reserved for heroes", "no note",
  "exact minute", "I'd never met", "half a block",
  "so the wind couldn't take it",
];

// Concreteness: a clock time, a number, a sound, a named thing.
const CONCRETE_PATTERNS: RegExp[] = [
  /\b\d{1,2}:\d{2}\b/,        // a time of day: 7:40
  /\b(noon|dawn|morning)\b/, // a named time of day
  /\b(orange|oranges|citrus|tabby|dandelion|elevator|bus|wind)\b/, // a named thing
  /\b(half a block|doorstep|bus stop)\b/, // a named place or measure
];

// Greeting-card phrasing and borrowed sentiment — penalised hard.
const CLICHE_PHRASES = [
  "blessed", "grateful", "count your blessings", "little things in life",
  "made my day", "warmed my heart", "faith in humanity", "kindness matters",
  "simple pleasures", "cherish every moment", "beautiful day",
];

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  let n = 0;
  for (const w of words) {
    if (lower.includes(w)) n += 1;
  }
  return n;
}

function score(line: string): { total: number; warmth: number; surprise: number; concrete: number; fresh: number } {
  const warmth = countMatches(line, WARM_WORDS);
  const surprise = countMatches(line, SURPRISE_MARKERS);
  let concrete = 0;
  for (const re of CONCRETE_PATTERNS) {
    if (re.test(line)) concrete += 1;
  }
  const lower = line.toLowerCase();
  let clicheHits = 0;
  for (const phrase of CLICHE_PHRASES) {
    if (lower.includes(phrase)) clicheHits += 1;
  }
  const fresh = clicheHits === 0 ? 2 : -4 * clicheHits;

  // Length: the brief says length for its own sake does not count, so the
  // length term is a small nudge toward the 110-170 character band where a
  // line has room for a turn without sprawling, never the deciding factor.
  const len = [...line].length;
  const lengthBonus = len >= 110 && len <= 170 ? 1 : 0;

  // Weights mirror the judge's order: warmth 3, surprise 2, concrete 2,
  // freshness 2, length 1.
  const total = warmth * 3 + surprise * 2 + concrete * 2 + fresh * 2 + lengthBonus;
  return { total, warmth, surprise, concrete, fresh };
}

function main(): void {
  // Rank candidates. Ties break toward the earlier candidate, so the
  // choice is stable and deterministic.
  let best = CANDIDATES[0];
  let bestScore = score(best);
  for (let i = 1; i < CANDIDATES.length; i += 1) {
    const s = score(CANDIDATES[i]);
    if (s.total > bestScore.total) {
      best = CANDIDATES[i];
      bestScore = s;
    }
  }

  // Gate: exactly one line, 1-200 characters, no leading/trailing
  // whitespace, no newline inside.
  const chars = [...best].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate failed: entry is ${chars} characters, must be 1-200`);
  }
  if (best.trim() !== best) {
    throw new Error("gate failed: entry has leading or trailing whitespace");
  }
  if (best.includes("\n") || best.includes("\r")) {
    throw new Error("gate failed: entry must be exactly one line");
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output/entry.txt";
  const dir = outDir.endsWith("entry.txt") ? outDir.slice(0, -"entry.txt".length) : outDir;
  const targetDir = dir === "" ? "." : dir;
  const target = join(targetDir, "entry.txt");
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(target, best, "utf8");

  // Read it back and verify the bytes match exactly.
  const readBack = readFileSync(target, "utf8");
  if (readBack !== best) {
    throw new Error("verify failed: file contents do not match the chosen line");
  }
  if ([...readBack].length !== chars) {
    throw new Error("verify failed: character count changed after write");
  }

  console.log(`picked candidate ${CANDIDATES.indexOf(best) + 1} of ${CANDIDATES.length}`);
  console.log(`score: total=${bestScore.total} warmth=${bestScore.warmth} surprise=${bestScore.surprise} concrete=${bestScore.concrete} fresh=${bestScore.fresh}`);
  console.log(`chars: ${chars}`);
  console.log(`wrote: ${target}`);
  console.log(`entry: ${best}`);
}

main();
