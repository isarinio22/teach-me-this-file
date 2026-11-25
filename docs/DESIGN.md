# Design

**Subject:** a one-to-one lesson with a good teacher, used by school students, often on a phone.
**Primary job:** keep the student on one step and one question at a time.

## The idea: a notebook page, not a chat

The screen is a sheet of white paper lying on a graph-paper desk. The student writes in pencil; the teacher marks in red pen.

| Color | Hex | Material | Used for | Contrast on paper |
|---|---|---|---|---|
| Paper | `#FFFFFF` | The sheet | The one surface content sits on; fields | |
| Desk | `#F5F7FC` | Graph paper | The page background | |
| Grid | `#DFE6F6` | Its lines | Grid lines and hairlines; never text | decorative |
| Ink | `#151A23` | Printed text | Text and headings | 17.4 : 1 |
| Graphite | `#4A515C` | Pencil | Filled bubbles, secondary text | 8.0 : 1 |
| Blue | `#2F62E0` | Ballpoint | The main button, links, numbers, focus | 5.3 : 1 |
| Pen red | `#C2203A` | The teacher's pen | Marks on answers, step outcomes, errors | 5.9 : 1 |
| Sage | `#D3E0C1` | A calm band | The header; the tutor's background | ink on sage 12.6 : 1 |
| Pencil | `#F6CD4C` | A school pencil | The pencil drawing; the highlight on a cited passage | decorative |

Red is reserved for the teacher's pen: marks and errors, nothing else.

## Type

One family: **Rubik** (variable, self-hosted with `@fontsource`). It covers Latin, accented Latin, Hebrew and Arabic, so a lesson in a right-to-left language uses the same typeface as the interface. KaTeX renders the math.

| Token | Size / line height | Role |
|---|---|---|
| `small` | 14 / 20 | Hints under fields, file details |
| `body` | 16 / 24 | Interface text, buttons, labels |
| `lesson` | 18 / 28 | Tutor notes and passages: the reading size |
| `step` | 22 / 28 | Step titles, section headings |
| `title` | 30 / 36 | Screen title on a phone |
| `display` | 40 / 46 | Screen title on desktop |

Weights: 400 for reading, 500 for controls, 700 for headings. Sentence case everywhere.

## Space, shape, motion

- **Spacing:** one 4px unit, used in steps of 1, 2, 3, 4, 5, 6, 8, 10, 12. Tap targets are at least 44px.
- **Widths:** the sheet is 40rem; the margin column is 15rem.
- **Radii:** `field` 14px, `sheet` 24px, and `pill` for buttons and answer bubbles.
- **One sheet per screen.** Each screen has a single white sheet with the only shadow in the app. Inside it, sections are separated by hairlines, not by more cards. Notes in the margin sit directly on the graph paper.
- **Motion:** a bubble filling in, a pen mark being drawn, and a slow pulse on the stage that is running while a lesson is built. All three are skipped under `prefers-reduced-motion`. Tutor text streams in; nothing fades.

## The one bold element: the answer sheet

Options are numbered bubbles, 1 to 4, as on a psychometric answer sheet. Numbers work in every language.

1. Tapping an option fills its bubble in graphite. "Check answer" hands the sheet in.
2. The result is marked in pen red: a tick beside a right answer, a cross through a wrong one. Shape carries the meaning, so it does not depend on color.
3. A missed option stays crossed out on the retry. The right answer is never shown until the method allows it.

The lesson path uses the same pen: a tick (right first time), a tick with one dot (after a hint), a tick with two dots (after a reteach), a circled number (needs review).

## Drawings and the tutor

- **The pencil** was drawn for this app as SVG, in the color tokens above. It rests on the corner of the sheet: it is the student's tool, and the reason filled bubbles are graphite.
- **Notebooks and books** lie on the graph-paper desk beside the sheet: a spiral notebook, a stack of books, and an open book with a teacher's tick. They are drawn for this app in the same color tokens, kept flat and away from the content, and shown only on wide screens, because a phone has no margin for them.
- **The tutor** is the app's author: a photo cut out from its background, set in ink on the sage circle and cropped close, so the face fills it. The portrait marks what the tutor says: the method notes on the Setup screen and each tutor note in the lesson. Tutor text itself stays on the sheet as notes, not in chat bubbles, because explanations, tables and formulas need the full width on a phone.

## Screens

"Build lesson" opens the lesson directly. Until 25 November a Plan screen for the teacher sat in between; on a phone it read like a test to answer, so it went.

```
SETUP (phone)
╭──────────────────────────────╮
│ Teach me this file           │
╰──────────────────────────────╯
  Turn a file into a lesson
╭───────────────────── ✎ ──────╮
│ 1. The file                  │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐ │
│ │ (Choose a file)          │ │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘ │
│ 2. How to teach it           │
│ ┌──────────────────────────┐ │
│ └──────────────────────────┘ │
│ (       Build lesson       ) │
╰──────────────────────────────╯
  ☺ How the lesson goes

LESSON (desktop: sheet + margin)              REPORT
╭───────────────────────────╮                 ╭──────────────────────────────╮
│ ✓  ✓. (3) 4  5  6         │                 │ Lesson report                │
│ Step 3 of 6               │                 │ 4 of 6 right on the first try│
│ Where the mass comes from │  Source, p. 2   ├──────────────────────────────┤
│ ☺ Tutor note, full width, │  "The tree      │ ✓  Step one     First try    │
│   on the sheet.           │   gained 74     │ ✓. Step two     After a hint │
│              (my reply)   │   kg, but …"    │ ○  Step three   Needs review │
│ ┌ Answer sheet ─────────┐ │                 ├──────────────────────────────┤
│ │ (1) From the soil   ✗ │ │                 │ Misconceptions caught        │
│ │ (●) From the air      │ │                 │ Thinks plants build their    │
│ │ (Check answer)        │ │                 │ body from soil (step 3)      │
│ └───────────────────────┘ │                 ├──────────────────────────────┤
│ (Ask a question)   (Stop) │                 │ (Teach another file)         │
╰───────────────────────────╯                 ╰──────────────────────────────╯
On a phone the margin becomes a bottom sheet opened by "Show source".
```

## How the design got here

**Round 1, before any code.** The first plan was checked against a list of generic patterns:

| First draft | Problem | Decision that stayed |
|---|---|---|
| Green for right, red for wrong | Traffic-light feedback fails for color-blind students | One red pen; a tick or a cross carries the meaning |
| A progress bar | Says how far, not how it went | A sequence of numbered steps, each with its outcome mark |
| Uppercase labels above sections | Reads as a template | Numbered sentence-case headings, like questions on a worksheet |
| Letters A to D on the options | Latin letters in a Hebrew or Arabic lesson | Numbers 1 to 4 |

**Round 2, after the first version was live.** That version was a printed exam page: a serif typeface, square corners, hairlines, no drawings. It was correct and it felt stern for school students. The change of direction took its cue from [Taitor](https://phenomenonstudio.com/projects/taitor-interactive-ai-tutoring-for-kids-and-teens), a tutoring app for kids and teens designed by Phenomenon Studio, which feels approachable without being childish. What was borrowed are general ideas: graph paper, one soft white sheet, pill buttons, a clear blue, a calm green header, a friendly sans, a face for the tutor. Nothing of Taitor's own was used: no mascot, illustration, logo or screen.

**Round 3, the tutor's face.** The first tutor was a simple geometric face drawn for the app, and it looked like generic flat AI art. A stock illustration would have been just as anonymous. The tutor is now a real person, the author, in the same ink as the rest of the page.

Two earlier rules were relaxed on purpose. "No rounded cards with soft shadows" became "one sheet per screen". The limit of six colors became nine, because a pencil has to be yellow.

## Quality floor

WCAG AA contrast (table above). Visible focus ring in blue. 44px tap targets. `prefers-reduced-motion` respected. `aria-live="polite"` on streaming text. Works at 375px wide. `dir="auto"` on lesson content, logical properties for layout.
