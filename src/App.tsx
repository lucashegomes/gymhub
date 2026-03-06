import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import DashboardPage from "./pages/dashboard/DashboardPage";
import StudentsPage from "./pages/students/StudentsPage";
import TeachersPage from "./pages/teachers/TeachersPage";
import CoursesPage from "./pages/courses/CoursesPage";
import ClassesPage from "./pages/classes/ClassesPage";
import CheckinsPage from "./pages/checkins/CheckinsPage";
import UsersPage from "./pages/users/UsersPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

            <Route
              path="/"
              element={
                <AuthGuard>
                  <DashboardPage />
                </AuthGuard>
              }
            />
            <Route
              path="/students"
              element={
                <AuthGuard>
                  <StudentsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/teachers"
              element={
                <AuthGuard>
                  <TeachersPage />
                </AuthGuard>
              }
            />
            <Route
              path="/courses"
              element={
                <AuthGuard>
                  <CoursesPage />
                </AuthGuard>
              }
            />
            <Route
              path="/classes"
              element={
                <AuthGuard>
                  <ClassesPage />
                </AuthGuard>
              }
            />
            <Route
              path="/checkins"
              element={
                <AuthGuard>
                  <CheckinsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/users"
              element={
                <AuthGuard>
                  <PermissionGuard resource="users" action="read">
                    <UsersPage />
                  </PermissionGuard>
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
