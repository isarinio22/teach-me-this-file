# Teach me this file

A teacher uploads school material and writes how it should be taught. A tutor then teaches it to a student one step at a time: it asks what the student already knows, teaches one idea, checks it with a multiple-choice question, and answers a wrong choice with a hint aimed at the misconception behind it, not with the answer.

**Live:** https://teach-me-this-file-132331256991.europe-west1.run.app (bring a Gemini API key)

The teaching method is in [docs/PEDAGOGY.md](docs/PEDAGOGY.md), and the design in [docs/DESIGN.md](docs/DESIGN.md).

## Using it

1. Press **Add API key** and paste a [Gemini API key](https://aistudio.google.com/apikey). It stays in the page's memory and is sent with each request; it is never stored or logged.
2. Choose a file: PDF, PNG, JPEG, WEBP, TXT or MD, up to 14 MB. Scans and photos work, because the model reads the pages.
3. Optionally, say how to teach it, for example "Teach this to 7th graders, in French. Be Socratic. Keep it under 15 minutes." Left empty, the lesson uses the file's language and takes about 15 minutes.
4. Press **Build lesson**. The screen counts the seconds while the plan is written, then the lesson opens for the student. A file that can't be taught stays here, with the reason.
5. The student answers on the answer sheet, or writes to the tutor. **Show source** opens the passage of the file behind a tutor note. **Stop** stops a reply.
6. At the end, the report shows how each step went and which misconceptions came up.

## Running it locally

Needs Node 24 or newer.

```bash
npm install
npm run dev        # client on http://localhost:5173, server on :3001
```

| Command | What it does |
|---|---|
| `npm run dev` | Client and server with hot reload |
| `npm test` | Unit tests (the model is mocked) |
| `npm run build && npm start` | Production build, served by the server on :3001 |
| `npm run scenarios` | AI behavior scenarios with real model calls; needs `GEMINI_API_KEY` in `.env` (see `.env.example`) |
| `npm run fixtures` | Rebuilds the synthetic test files |

Models are set in `server/config.js`. Each can be swapped without a code change through an environment variable of the same name, for example `PLAN_MODEL=gemini-4-carbon npm start`.

## Deploying

One container on Google Cloud Run, which serves the API and the built client from the same URL. The steps and the reasons for each setting are in [docs/DEPLOY.md](docs/DEPLOY.md). No API key is ever set on the host.

## How it works

- **The app decides, the model talks.** The lesson plan and the student's progress live in app state (`client/src/lesson.js`). `nextMove()` picks what happens next; multiple-choice answers are graded by the app. The model only writes the words of each move.
- **Two models.** A plan model reads the file once and returns the lesson plan as structured JSON, checked against the teaching rules with one repair if needed. A fast tutor model writes each turn, streamed. Each hands over to two backup models in turn when Google says it is busy or over its limit, and the plan model also when it is too slow; for a plan, the backups take turns for a few tries, with short waits. The models and their limits are in `server/config.js`.
- **A stateless server.** Every request carries what it needs, so a sleeping server loses nothing. A turn sends only the current step's passages, never the whole file.

## Project structure

```
client/index.html                     Page shell
client/vite.config.js                 Vite: React, Tailwind, and the /api proxy in development
client/src/main.jsx                   Starts React and loads the font
client/src/App.jsx                    Switches screens; holds the API key, the build and the lesson state
client/src/styles.css                 Design tokens (colors, type, radii, animations) and lesson text styles
client/src/api.js                     Calls the server and reads its event streams
client/src/lesson.js                  Lesson state, nextMove() and the teaching rules; pure functions
client/src/lesson.test.js             Tests for the hint ladder, outcomes, the end of the lesson, shuffling and what the tutor sees
client/src/screens/SetupScreen.jsx    File and prompt, build progress with a count of the seconds, errors
client/src/screens/LessonScreen.jsx   The lesson: runs each tutor turn, Stop, Retry, sources
client/src/screens/ReportScreen.jsx   Each step's outcome and the misconceptions caught
client/src/components/Button.jsx      The one button component
client/src/components/Alert.jsx       Error and info messages
client/src/components/Settings.jsx    The API key panel
client/src/components/LessonPath.jsx  The row of steps with their pen marks
client/src/components/TutorNote.jsx   A tutor note; Markdown, tables and KaTeX formulas; the typing bubble
client/src/components/LessonGuide.jsx The words that tell the student what is happening and what to do
client/src/components/AnswerSheet.jsx The check question as answer-sheet bubbles
client/src/components/SourceNote.jsx  Source passages: margin column or bottom sheet
client/src/components/Drawings.jsx    The tutor's portrait, the pencil, and the notebooks on the desk
client/src/components/tutor.webp      The tutor's portrait
server/index.js                       Express: /api/health, /api/lessons, /api/turn, and the built client
server/config.js                      Model names, limits and the token budget
server/files.js                       Upload checks by magic bytes
server/files.test.js                  Tests for the upload checks
server/gemini.js                      Every model call: token count, plan, tutor turn, error messages
server/gemini.test.js                 Tests for the plan's deadline, backups, repair and errors, and the tutor's backups, with a mocked SDK
server/schemas.js                     Zod schemas for the plan, the turn request and the turn result
server/stream.js                      Server-Sent Events, and the splitter for the tutor's text and JSON
server/stream.test.js                 Tests for the splitter
server/prompts/plan.md                How a file becomes a lesson plan
server/prompts/tutor.md               How the tutor makes each move
scenarios/run.js                      AI behavior scenarios with real model calls
scripts/make-fixtures.js              Builds the synthetic test files
test-files/synthetic/                 The test files: lesson text, injection, receipt, blank, table, long, fake PDF
docs/PEDAGOGY.md                      The teaching method
docs/DESIGN.md                        The design system
docs/DEPLOY.md                        Deploying to Cloud Run
docs/scenario-results.md              The latest scenario results
Dockerfile                            Two-stage build of the container
```
