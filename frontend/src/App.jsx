import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import TeacherRegister from './pages/TeacherRegister';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateQuiz from './pages/CreateQuiz';
import QuizAttempts from './pages/QuizAttempts';
import StudentRegister from './pages/StudentRegister';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import TakeQuiz from './pages/TakeQuiz';
import QuizResult from './pages/QuizResult';

function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/teacher/register" element={<TeacherRegister />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route
            path="/teacher/dashboard"
            element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>}
          />
          <Route
            path="/teacher/quizzes/new"
            element={<ProtectedRoute role="teacher"><CreateQuiz /></ProtectedRoute>}
          />
          <Route
            path="/teacher/quizzes/:quizId/attempts"
            element={<ProtectedRoute role="teacher"><QuizAttempts /></ProtectedRoute>}
          />

          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student/dashboard"
            element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}
          />
          <Route
            path="/student/quizzes/:quizId/take"
            element={<ProtectedRoute role="student"><TakeQuiz /></ProtectedRoute>}
          />
          <Route
            path="/student/quizzes/:quizId/result"
            element={<ProtectedRoute role="student"><QuizResult /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
