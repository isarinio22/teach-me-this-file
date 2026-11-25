# How the tutor teaches

I taught psychometric exam prep and managed a team of teachers. This app teaches the way I trained teachers to teach. The method lives in code (`client/src/lesson.js`) and in the prompts (`server/prompts/`), not only in the model's goodwill.

## The method

1. **Find out where the student is.** The lesson opens with one short question about what the student already knows. The answer sets the pace.
2. **One idea per step.** Each step is small enough to check with a single question.
3. **Check with a real question.** Never "Do you understand?". Every step ends with a multiple-choice item, the format I taught for years.
4. **Every wrong option means something.** Each distractor is written to catch one specific misconception. When a student picks it, we know what they think, and the hint goes straight at that idea.
5. **Hints climb a ladder; they don't jump to the answer.**
   - First miss: a hint aimed at the misconception, then try again.
   - Second miss: explain it differently (an analogy or a worked example), then ask a parallel question. It's a new question, so the student can't just eliminate options.
   - Miss on the parallel question: explain the answer clearly, mark the step "needs review", and move on.
6. **Right answers get a short "why",** so a lucky guess still teaches something.
7. **The student does the thinking.** Tutor turns are short and always end with something for the student to do.
8. **End with a summary.** The tutor wraps up: what went well, and the one idea most worth going over again. Earlier steps are not asked again at the end (my decision, 25 November: it felt like repeating questions already answered); the report shows the teacher every weak step.
9. **Stay inside the material.** If the file doesn't cover something, the tutor says so and returns to the lesson.
10. **The teacher stays in charge.** The teacher's prompt sets the language, level, tone and length. The method itself stays the same.

## Details a test writer cares about

- **Answer positions are shuffled in the app.** Models tend to put the right answer in the same place, and students learn to exploit patterns like that.
- **Multiple-choice answers are graded by the app, not the model:** instantly, and always correctly.
- **Each step's outcome is recorded:** first try, after a hint, after a reteach, or needs review.
- **The end-of-lesson report** shows each step's outcome and the misconceptions caught. It's what a teacher would want to know the next morning.
