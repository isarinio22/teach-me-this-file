# Design

**Subject:** a one-to-one lesson with a good teacher, used by school students, often on a phone.
**Primary job:** keep the student on one step and one question at a time.

## The idea: a worksheet, not a chat

The screen is treated as school paper. Four materials, each with one job:

| Color | Hex | Material | Used for | Contrast on paper |
|---|---|---|---|---|
| Paper | `#FAFBFC` | Exam paper, cool white | Every background | |
| Ink | `#18202B` | Printed text | Lesson text, headings | 15.8 : 1 |
| Graphite | `#454B54` | Pencil | Filled bubbles, secondary text | 8.5 : 1 |
| Form blue | `#14639E` | The ink an answer sheet is printed in | Bubbles, field borders, buttons, links, focus | 6.1 : 1 |
| Pen red | `#C2203A` | The teacher's pen | Marks on answers, step outcomes, errors | 5.7 : 1 |
| Rule | `#D3E2EE` | Ruled lines | Hairlines between sections; never text | decorative |

The student writes in pencil; the teacher marks in pen. Nothing else on the screen uses red.

## Type

One family: **Frank Ruhl Libre** (variable, self-hosted with `@fontsource`). It covers Latin, accented Latin and Hebrew. It is the typeface of Hebrew textbooks, and as a serif it sits naturally next to KaTeX formulas. Arabic falls back to the system font.

| Token | Size / line height | Role |
|---|---|---|
| `small` | 14 / 20 | Hints under fields, file details |
| `body` | 16 / 24 | Interface text, buttons, labels |
| `lesson` | 18 / 30 | Tutor notes and passages: the reading size |
| `step` | 22 / 29 | Step titles, section headings |
| `title` | 28 / 34 | Screen title on a phone |
| `display` | 36 / 42 | Screen title on desktop |

Weights: 400 for reading, 500 for controls, 700 for headings. Sentence case everywhere.

## Space, shape, lines, motion

- **Spacing:** one 4px unit, used in steps of 1, 2, 3, 4, 6, 8, 12. Tap targets are at least 44px.
- **Widths:** the page column is 40rem; the margin column for sources is 16rem.
- **Radii:** `form` 3px for fields, buttons and panels, like printed boxes; `bubble` for the round answer bubbles. Nothing in between.
- **Lines, not cards:** sections are separated by ruled hairlines. The only shadow is under the mobile bottom sheet. The margin column is set off by a thin red margin line, as in a notebook.
- **Motion:** two animations only: a bubble filling in, and a pen mark being drawn. Both are skipped under `prefers-reduced-motion`. Tutor text streams in; nothing fades.

## The one bold element: the answer sheet

Options are numbered bubbles, 1 to 4, as on a psychometric answer sheet. Numbers work in every language.

1. Tapping an option fills its bubble in graphite. "Check answer" hands the sheet in.
2. The result is marked in pen red: a tick beside a right answer, a cross through a wrong one. Shape carries the meaning, so it does not depend on color.
3. A missed option stays crossed out on the retry. The right answer is never shown until the method allows it.

The lesson path uses the same pen: a tick (right first time), a tick with one dot (after a hint), a tick with two dots (after a reteach), a circled number (needs review).

## Screens

```
SETUP (phone)                     PLAN
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ Teach me this file [API key] │  │ Photosynthesis               │
├──────────────────────────────┤  │ 6 steps. About 15 minutes.   │
│ Turn a file into a lesson    │  ├──────────────────────────────┤
│ 1. The file                  │  │ 1 Where the mass comes from  │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐ │  │   Objective: explain that …  │
│ │ [Choose a file]          │ │  │   Check: "A tree gains …"    │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘ │  │                [Remove step] │
│ 2. How to teach it           │  ├──────────────────────────────┤
│ ┌──────────────────────────┐ │  │ 2 Two stages                 │
│ │ Teach this to 7th …      │ │  │   …                          │
│ └──────────────────────────┘ │  ├──────────────────────────────┤
│ [       Build lesson       ] │  │ [       Start lesson       ] │
└──────────────────────────────┘  └──────────────────────────────┘

LESSON (desktop: text + margin)               REPORT
┌───────────────────────────┬──────────────┐  ┌──────────────────────────────┐
│ ✓  ✓. (3) 4  5  6         │              │  │ Lesson report                │
│ Step 3 of 6               │              │  │ 4 of 6 right on the first try│
│ Where the mass comes from │ Source, p. 2 │  ├──────────────────────────────┤
│ Tutor note, full width,   │ "The tree    │  │ ✓  Step one     First try    │
│ no bubble, no avatar.     │  gained 74   │  │ ✓. Step two     After a hint │
│              my reply   ▐ │  kg, but …"  │  │ ○  Step three   Needs review │
│ ┌ Answer sheet ─────────┐ │              │  ├──────────────────────────────┤
│ │ (1) From the soil   ✗ │ │              │  │ Misconceptions caught        │
│ │ (●) From the air      │ │              │  │ Thinks plants build their    │
│ │ [Check answer]        │ │              │  │ body from soil (step 3)      │
│ └───────────────────────┘ │              │  ├──────────────────────────────┤
│ [Ask a question]   [Stop] │              │  │ [Teach another file]         │
└───────────────────────────┴──────────────┘  └──────────────────────────────┘
On a phone the margin becomes a bottom sheet opened by "Show source".
```

## What changed after checking against the avoid list

| First draft | Problem | Now |
|---|---|---|
| A sans such as Rubik or Heebo | The default for any Hebrew-capable interface; clashes with KaTeX's serif math | Frank Ruhl Libre |
| Green for right, red for wrong | Traffic-light feedback is generic and fails for color-blind students | One red pen; a tick or a cross carries the meaning |
| Warm off-white paper with the red accent | Too close to "cream with terracotta" | Cool white paper, a blue-leaning red |
| The plan and the report as cards with shadows | Identical rounded cards | Ruled rows on one page, 3px corners, one shadow in the whole app |
| A progress bar | Says how far, not how it went | A sequence of numbered steps, each with its outcome mark |
| Uppercase labels above sections; "Step 3 of 6 · 6 min left" | All-caps eyebrows; dot-joined meta strings | Numbered sentence-case headings, like questions on a worksheet; separate lines |
| Letters A to D on the options | Latin letters in a Hebrew or Arabic lesson | Numbers 1 to 4 |

## Quality floor

WCAG AA contrast (table above). Visible focus ring in form blue. 44px tap targets. `prefers-reduced-motion` respected. `aria-live="polite"` on streaming text. Works at 375px wide. `dir="auto"` on lesson content, logical properties for layout.
