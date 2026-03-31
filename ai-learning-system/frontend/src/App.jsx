import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts & Guards
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// App pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentListPage from './pages/Documents/DocumentListPage';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';
import FlashcardListPage from './pages/FlashCards/FlashcardListPage';
import FlashcardPage from './pages/FlashCards/FlashcardPage';
import QuizTakePage from './pages/Quizzes/QuizTakePage';
import QuizResultPage from './pages/Quizzes/QuizResultPage';
import QuizListPage from './pages/Quizzes/QuizListPage';
import QuizGeneratePage from './pages/Quizzes/QuizGeneratePage';
import RecommendationPage from './pages/Recommendations/RecommendationPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/flashcards" element={<FlashcardListPage />} />
          <Route path="/flashcards/:id" element={<FlashcardPage />} />
          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quiz/generate/:documentId" element={<QuizGeneratePage />} />
          <Route path="/quiz/:id" element={<QuizTakePage />} />
          <Route path="/quiz/:id/result" element={<QuizResultPage />} />
          <Route path="/recommendations" element={<RecommendationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
