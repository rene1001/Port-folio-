import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/Router.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Profile } from '../../types.ts';
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  PlusCircle,
  Cpu,
  Briefcase,
  GraduationCap,
  Mail,
  User,
  Settings,
  Image,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Bell,
  Terminal,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actionButton,
}) => {
  const { currentPath } = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.getProfile().then(res => setProfile(res)).catch(() => {});
  }, []);

  const menuItems = [
    { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    {
      label: 'Projets',
      path: '/admin/projets',
      icon: FolderGit2,
      subLinks: [{ label: '+ Nouveau projet', path: '/admin/projets/nouveau' }],
    },
    {
      label: 'Blog & Articles',
      path: '/admin/blog',
      icon: FileText,
      subLinks: [{ label: '+ Nouvel article', path: '/admin/blog/nouveau' }],
    },
    { label: 'Compétences', path: '/admin/competences', icon: Cpu },
    { label: 'Services', path: '/admin/services', icon: Briefcase },
    { label: 'Parcours & Études', path: '/admin/parcours', icon: GraduationCap },
    { label: 'Messages reçus', path: '/admin/messages', icon: Mail },
    { label: 'Médiathèque', path: '/admin/medias', icon: Image },
    { label: 'Profil personnel', path: '/admin/profil', icon: User },
    { label: 'Paramètres', path: '/admin/parametres', icon: Settings },
  ];

  const isCurrent = (path: string) => {
    if (path === '/admin' && currentPath === '/admin') return true;
    if (path !== '/admin' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header / Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">Admin CMS</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuItems.map(item => {
              const active = isCurrent(item.path);
              const Icon = item.icon;
              return (
                <div key={item.path} className="space-y-0.5">
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>

                  {/* Sub links (e.g. + Nouveau projet) */}
                  {item.subLinks && (
                    <div className="pl-9 pr-2 py-0.5 space-y-0.5">
                      {item.subLinks.map(sub => {
                        const subActive = currentPath === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`block py-1 px-2 rounded-lg text-xs font-medium transition ${
                              subActive
                                ? 'text-indigo-400 bg-indigo-950/40 font-semibold'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>Voir le site public</span>
            </span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <Link to="/admin/profil" className="flex items-center gap-2.5 overflow-hidden group">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile?.name || user?.name || 'Admin'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== window.location.origin + '/images/rene_avatar.jpg') {
                        target.src = '/images/rene_avatar.jpg';
                      }
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-indigo-400">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition truncate">
                  {profile?.name || user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{profile?.email || user?.email}</p>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              title="Se déconnecter"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition shrink-0"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Link to="/admin" className="hover:text-white">Admin</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-200 font-medium">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
            >
              <span>Site Public</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/admin/profil"
              className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Gérer mon profil"
            >
              <span className="text-xs font-semibold text-slate-200 hidden md:inline">
                {profile?.name?.split(' ')[0] || user?.name || 'Profil'}
              </span>
              <div className="w-7 h-7 rounded-md bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-700">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile?.name || 'Photo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== window.location.origin + '/images/rene_avatar.jpg') {
                        target.src = '/images/rene_avatar.jpg';
                      }
                    }}
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Header Title & Action button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {title}
              </h1>
              {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {actionButton && <div>{actionButton}</div>}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};
