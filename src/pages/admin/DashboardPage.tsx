import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { useRouter, Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import type { DashboardStats, Profile } from '../../types.ts';
import {
  FolderGit2,
  FileText,
  Mail,
  Cpu,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ExternalLink,
  User,
  Settings,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getProfile()])
      .then(([statsRes, profRes]) => {
        setStats(statsRes);
        setProfile(profRes);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      title="Tableau de Bord"
      subtitle="Vue d'ensemble de votre portfolio et gestion de vos contenus en direct"
      actionButton={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/projets/nouveau"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau projet</span>
          </Link>
          <Link
            to="/admin/blog/nouveau"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel article</span>
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement des données...</div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Welcome User Banner with Profile Photo */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile?.name || 'Photo de profil'}
                    className="w-full h-full object-cover rounded-[14px]"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== window.location.origin + '/images/rene_avatar.jpg') {
                        target.src = '/images/rene_avatar.jpg';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <User className="w-7 h-7 text-indigo-400" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Bienvenue, {profile?.name || 'Administrateur'}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-indigo-300 font-mono">
                  {profile?.title || 'Ingénieur en Informatique & Architecte Logiciel'}
                </p>
                <p className="text-xs text-slate-400">
                  Votre CMS est prêt. Toutes vos modifications sont publiées instantanément sans toucher au code.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              <Link
                to="/admin/profil"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Modifier photo & profil</span>
              </Link>
              <Link
                to="/"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
              >
                <span>Voir mon site</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Projects Metric */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                  Projets
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <FolderGit2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{stats.totalProjects}</span>
                <span className="text-xs text-slate-400">au total</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <span className="text-emerald-400 font-medium">{stats.publishedProjects} publiés</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">{stats.draftProjects} brouillons</span>
              </div>
            </div>

            {/* Posts Metric */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                  Articles Blog
                </span>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{stats.totalPosts}</span>
                <span className="text-xs text-slate-400">articles</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <span className="text-emerald-400 font-medium">{stats.publishedPosts} en ligne</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">{stats.draftPosts} brouillons</span>
              </div>
            </div>

            {/* Messages Metric */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                  Messages reçus
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{stats.totalMessages}</span>
                <span className="text-xs text-slate-400">messages</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs border-t border-slate-800/80 pt-3">
                {stats.unreadMessages > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {stats.unreadMessages} nouveau{stats.unreadMessages > 1 ? 'x' : ''} à lire
                  </span>
                ) : (
                  <span className="text-slate-400">Tous les messages sont traités</span>
                )}
              </div>
            </div>

            {/* Skills & Services Metric */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                  Expertises
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{stats.totalSkills}</span>
                <span className="text-xs text-slate-400">compétences</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <span>{stats.totalServices} services proposés</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-900/30 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Actions rapides</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                to="/admin/projets/nouveau"
                className="p-4 rounded-xl bg-slate-900/80 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 transition group"
              >
                <div className="text-white font-semibold text-sm group-hover:text-indigo-300">
                  + Ajouter un projet
                </div>
                <p className="text-xs text-slate-400 mt-1">Publier une nouvelle réalisation</p>
              </Link>
              <Link
                to="/admin/blog/nouveau"
                className="p-4 rounded-xl bg-slate-900/80 hover:bg-cyan-600/20 border border-slate-800 hover:border-cyan-500/40 transition group"
              >
                <div className="text-white font-semibold text-sm group-hover:text-cyan-300">
                  + Rédiger un article
                </div>
                <p className="text-xs text-slate-400 mt-1">Créer un nouveau post technique</p>
              </Link>
              <Link
                to="/admin/messages"
                className="p-4 rounded-xl bg-slate-900/80 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/40 transition group"
              >
                <div className="text-white font-semibold text-sm group-hover:text-emerald-300">
                  Consulter les messages
                </div>
                <p className="text-xs text-slate-400 mt-1">Demandes reçues par formulaire</p>
              </Link>
              <Link
                to="/admin/profil"
                className="p-4 rounded-xl bg-slate-900/80 hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/40 transition group"
              >
                <div className="text-white font-semibold text-sm group-hover:text-purple-300">
                  Modifier le profil
                </div>
                <p className="text-xs text-slate-400 mt-1">Bio, coordonnées & réseaux</p>
              </Link>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Activité récente</span>
              </h2>
              <span className="text-xs text-slate-400">Mises à jour automatiques</span>
            </div>

            {stats.recentActivities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune activité enregistrée.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {stats.recentActivities.map(act => (
                  <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        {act.type.includes('project') && (
                          <FolderGit2 className="w-4 h-4 text-indigo-400" />
                        )}
                        {act.type.includes('post') && (
                          <FileText className="w-4 h-4 text-cyan-400" />
                        )}
                        {act.type.includes('message') && (
                          <Mail className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{act.title}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 font-mono">
                      {new Date(act.timestamp).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};
