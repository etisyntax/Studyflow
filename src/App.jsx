import { Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Lesson from "./pages/Lesson";
import Quizzes from "./pages/Quizzes";
import Quiz from "./pages/Quiz";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<Lesson />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/quizzes/:quizId" element={<Quiz />} />
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  );
}

export default App;