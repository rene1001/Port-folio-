import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './router/Router.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';

// Public pages
import { HomePage } from './pages/public/HomePage.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { ProjectsPage } from './pages/public/ProjectsPage.tsx';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage.tsx';
import { BlogPage } from './pages/public/BlogPage.tsx';
import { PostDetailPage } from './pages/public/PostDetailPage.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';

// Admin pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';
import { DashboardPage } from './pages/admin/DashboardPage.tsx';
import { ProjectsListPage } from './pages/admin/ProjectsListPage.tsx';
import { ProjectFormPage } from './pages/admin/ProjectFormPage.tsx';
import { PostsListPage } from './pages/admin/PostsListPage.tsx';
import { PostFormPage } from './pages/admin/PostFormPage.tsx';
import { SkillsPage } from './pages/admin/SkillsPage.tsx';
import { ServicesPage } from './pages/admin/ServicesPage.tsx';
import { ParcoursPage } from './pages/admin/ParcoursPage.tsx';
import { MessagesPage } from './pages/admin/MessagesPage.tsx';
import { MediaManagerPage } from './pages/admin/MediaManagerPage.tsx';
import { ProfilePage } from './pages/admin/ProfilePage.tsx';
import { SettingsPage } from './pages/admin/SettingsPage.tsx';

// Protected Admin Route wrapper
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Vérification de la session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { currentPath, navigate } = useRouter();

  // Raccourci sécurisé pour l'administrateur : Ctrl+Alt+A (ou Cmd+Option+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Route: /admin/login
  if (currentPath === '/admin/login') {
    return <AdminLoginPage />;
  }

  // Admin Routes (Protected)
  if (currentPath.startsWith('/admin')) {
    // Project edit: /admin/projets/edit/:id
    const editProjectMatch = currentPath.match(/^\/admin\/projets\/edit\/([^/]+)$/);
    if (editProjectMatch) {
      return (
        <ProtectedAdminRoute>
          <ProjectFormPage projectId={editProjectMatch[1]} />
        </ProtectedAdminRoute>
      );
    }

    // Post edit: /admin/blog/edit/:id
    const editPostMatch = currentPath.match(/^\/admin\/blog\/edit\/([^/]+)$/);
    if (editPostMatch) {
      return (
        <ProtectedAdminRoute>
          <PostFormPage postId={editPostMatch[1]} />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/projets/nouveau') {
      return (
        <ProtectedAdminRoute>
          <ProjectFormPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/projets') {
      return (
        <ProtectedAdminRoute>
          <ProjectsListPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/blog/nouveau') {
      return (
        <ProtectedAdminRoute>
          <PostFormPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/blog') {
      return (
        <ProtectedAdminRoute>
          <PostsListPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/competences') {
      return (
        <ProtectedAdminRoute>
          <SkillsPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/services') {
      return (
        <ProtectedAdminRoute>
          <ServicesPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/parcours') {
      return (
        <ProtectedAdminRoute>
          <ParcoursPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/messages') {
      return (
        <ProtectedAdminRoute>
          <MessagesPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/medias') {
      return (
        <ProtectedAdminRoute>
          <MediaManagerPage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/profil') {
      return (
        <ProtectedAdminRoute>
          <ProfilePage />
        </ProtectedAdminRoute>
      );
    }

    if (currentPath === '/admin/parametres') {
      return (
        <ProtectedAdminRoute>
          <SettingsPage />
        </ProtectedAdminRoute>
      );
    }

    // Default /admin -> Dashboard
    return (
      <ProtectedAdminRoute>
        <DashboardPage />
      </ProtectedAdminRoute>
    );
  }

  // Public Routes
  if (currentPath === '/a-propos') {
    return <AboutPage />;
  }

  if (currentPath === '/projets') {
    return <ProjectsPage />;
  }

  // Project Detail: /projets/:slug
  const projectDetailMatch = currentPath.match(/^\/projets\/([^/]+)$/);
  if (projectDetailMatch) {
    return <ProjectDetailPage slug={projectDetailMatch[1]} />;
  }

  if (currentPath === '/blog') {
    return <BlogPage />;
  }

  // Post Detail: /blog/:slug
  const postDetailMatch = currentPath.match(/^\/blog\/([^/]+)$/);
  if (postDetailMatch) {
    return <PostDetailPage slug={postDetailMatch[1]} />;
  }

  if (currentPath === '/contact') {
    return <ContactPage />;
  }

  // Default: Homepage
  return <HomePage />;
};

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
