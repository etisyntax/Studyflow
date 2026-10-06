# StudyFlow

**A web based interactive learning and progress tracking platform for students learning web development.**

StudyFlow brings lessons, practice and quizzes together in one place. Students read structured lessons, practise in a live code playground inside every lesson, take quizzes that are marked securely on the server, and track their progress with a personal dashboard and achievement badges.

**Live site:** https://studyflow-hazel-omega.vercel.app

---

## Try it

You can create your own free account in a few seconds, or log in with the demo account, which already has three weeks of realistic progress:

| Email | Password |
| --- | --- |
| demo@studyflow.app | StudyFlow2026 |

---

## What makes StudyFlow different

Most learning sites treat lessons and quizzes as separate things: a quiz ends with a score, and that is it. StudyFlow connects them into one **learning loop**.

Every quiz question is linked to the exact lesson it tests. When a student finishes a quiz, StudyFlow groups their wrong answers by lesson and builds a **personal revision plan**, ranked from weakest to strongest, with a button straight to each lesson. Two students with the same score get different plans, because they missed different things.

---

## Features

**Learning**
- 7 courses, from HTML to React, with 100 structured lessons
- Every lesson follows the same structure: introduction, explanations, common mistakes, a quick recap and a "try it yourself" challenge
- A reading progress bar, previous and next navigation, and a "Mark as complete" button

**Live code playground**
- HTML, CSS, Bootstrap and Tailwind lessons show a live preview
- JavaScript lessons show console output
- TypeScript code is compiled in the browser before it runs
- React lessons render a live React component
- Full screen mode, keyboard shortcuts and a reset button

**Quizzes**
- 27 quizzes with 540 questions, at Easy, Medium and Hard levels
- Instant feedback and an explanation after every answer
- A results screen with a score ring, personal best tracking and a review of every answer
- A personal revision plan based on the questions you missed

**Progress and motivation**
- A dashboard with stats, course progress, recent activity and a "Continue learning" card
- A full quiz history with filters and sorting
- 12 achievement badges, with a celebration when one is unlocked
- A profile page with editable name, stats and badge collection

**Quality**
- Responsive design for phones, tablets and desktops
- Keyboard focus rings, screen reader labels and support for reduced motion
- A friendly "Page not found" screen

---

## Built with

| Layer | Technology |
| --- | --- |
| Frontend | React, built with Vite |
| Navigation | React Router |
| Backend and database | Supabase (PostgreSQL and Supabase Auth) |
| Hosting | Vercel, deployed automatically from GitHub |
| Lesson content | react-markdown |
| Icons | Phosphor Icons |

---

## How it works

```
Student's browser  ->  React app (pages, components, code playground)
                          |
                          v
                     Supabase
                     - Auth: sign up, log in, signed JWT tokens
                     - PostgreSQL database with Row Level Security
                     - Database functions for secure quiz marking
```

React builds what the student sees, Supabase stores the data and enforces the security, and Vercel puts it online.

---

## Security

- **Hashed passwords:** authentication is handled by Supabase Auth, so passwords are never stored as plain text.
- **Row Level Security:** every table has rules in the database itself, so each student can only read and change their own data.
- **Hidden answers:** the correct answers are never sent to the browser. Column level security hides them, and the `check_answer` function only reveals the correct answer after a student has chosen.
- **Verified scores:** quiz scores are calculated inside the database by the `submit_quiz` function, so they cannot be faked from the browser.
- **Safe playground:** student JavaScript runs in a Web Worker with time limits, so an infinite loop cannot freeze the page, and HTML previews run in a sandboxed iframe, so student code cannot touch the StudyFlow site.

---

## Database

| Table | Purpose |
| --- | --- |
| `profiles` | Each student's name and join date |
| `courses` | The 7 courses, with colour and order |
| `lessons` | The lessons in each course, written in Markdown |
| `quizzes` | Each quiz, its difficulty and the lessons it covers |
| `questions` | Quiz questions, each linked to its lesson |
| `completions` | Which lessons each student has completed |
| `quiz_results` | Every quiz attempt and its verified score |

Achievement badges are calculated from existing completions and quiz results, so they need no extra table.

---

## Project structure

```
src/
  components/   Shared pieces: layout, code playground, icons, logo, stepper
  context/      Shared state: logged in user and badge celebrations
  lib/          Supabase connection and achievement logic
  pages/        One file per page: Landing, Dashboard, Courses, Lesson, Quiz and more
```

---

## Running it locally

1. Clone the repository and install the packages:

```bash
   git clone https://github.com/etisyntax/Studyflow.git
   cd Studyflow
   npm install
```

2. Create a file called `.env` in the main folder, with your own Supabase project details:

```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_KEY=your-supabase-anon-key
```

3. Start the development server:

```bash
   npm run dev
```

4. Open http://localhost:5173 in your browser.

---

## Future improvements

- A lecturer dashboard, where a lecturer can see verified progress for their whole class
- Password reset by email
- Full TypeScript type checking in the playground
- More courses, such as Python and databases

---

## Author

**Goodwill Okon**
IT defense project, 2026