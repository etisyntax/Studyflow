import { supabase } from "./supabase";
import {
  BookOpenIcon,
  StarIcon,
  ZapIcon,
  LayersIcon,
  AwardIcon,
  TargetIcon,
  TrophyIcon,
} from "../components/Icons";

export const achievements = [
  { id: "first-steps", title: "First Steps", description: "Complete your first lesson.", icon: BookOpenIcon, target: 1, progress: (s) => s.lessonsDone },
  { id: "getting-started", title: "Getting Started", description: "Complete 5 lessons.", icon: BookOpenIcon, target: 5, progress: (s) => s.lessonsDone },
  { id: "dedicated", title: "Dedicated Learner", description: "Complete 25 lessons.", icon: StarIcon, target: 25, progress: (s) => s.lessonsDone },
  { id: "halfway", title: "Halfway Hero", description: "Complete 50 lessons.", icon: ZapIcon, target: 50, progress: (s) => s.lessonsDone },
  { id: "explorer", title: "Explorer", description: "Start 3 different courses.", icon: LayersIcon, target: 3, progress: (s) => s.coursesStarted },
  { id: "course-complete", title: "Course Complete", description: "Finish every lesson in a course.", icon: AwardIcon, target: 1, progress: (s) => s.coursesCompleted },
  { id: "first-quiz", title: "First Quiz", description: "Take your first quiz.", icon: TargetIcon, target: 1, progress: (s) => s.quizzesTaken },
  { id: "quiz-regular", title: "Quiz Regular", description: "Take 10 quizzes.", icon: TargetIcon, target: 10, progress: (s) => s.quizzesTaken },
  { id: "high-achiever", title: "High Achiever", description: "Score 90% or more on a quiz.", icon: TrophyIcon, target: 90, unit: "%", progress: (s) => s.bestScore },
  { id: "perfect", title: "Perfect Score", description: "Score 100% on a quiz.", icon: StarIcon, target: 100, unit: "%", progress: (s) => s.bestScore },
  { id: "hard-mode", title: "Hard Mode", description: "Pass a Hard quiz with 70% or more.", icon: ZapIcon, target: 1, progress: (s) => s.hardPassed },
  { id: "quiz-master", title: "Quiz Master", description: "Pass 10 different quizzes.", icon: AwardIcon, target: 10, progress: (s) => s.quizzesPassed },
];

export function computeStats({ courses, completions, results }) {
  const completedIds = new Set(completions.map((item) => item.lesson_id));

  const coursesStarted = courses.filter((course) =>
    course.lessons.some((lesson) => completedIds.has(lesson.id))
  ).length;

  const coursesCompleted = courses.filter(
    (course) =>
      course.lessons.length > 0 &&
      course.lessons.every((lesson) => completedIds.has(lesson.id))
  ).length;

  const withPercent = results.map((item) => ({
    ...item,
    percent: Math.round((item.score / item.total) * 100),
  }));

  const passed = withPercent.filter((item) => item.percent >= 70);

  return {
    lessonsDone: completedIds.size,
    coursesStarted,
    coursesCompleted,
    quizzesTaken: results.length,
    bestScore: withPercent.length > 0 ? Math.max(...withPercent.map((item) => item.percent)) : 0,
    quizzesPassed: new Set(passed.map((item) => item.quiz_id)).size,
    hardPassed: new Set(
      passed
        .filter((item) => item.quizzes && item.quizzes.difficulty === "hard")
        .map((item) => item.quiz_id)
    ).size,
  };
}

export function evaluateAchievements(stats) {
  return achievements.map((achievement) => {
    const current = Math.min(achievement.progress(stats), achievement.target);
    return { ...achievement, current, earned: current >= achievement.target };
  });
}

export async function loadAchievementData() {
  const [courseRes, completionRes, resultRes] = await Promise.all([
    supabase.from("courses").select("id, lessons(id)"),
    supabase.from("completions").select("lesson_id"),
    supabase.from("quiz_results").select("quiz_id, score, total, quizzes(difficulty)"),
  ]);

  if (courseRes.error || completionRes.error || resultRes.error) {
    throw new Error("Could not load achievements");
  }

  const stats = computeStats({
    courses: courseRes.data,
    completions: completionRes.data,
    results: resultRes.data,
  });

  return { stats, badges: evaluateAchievements(stats) };
}