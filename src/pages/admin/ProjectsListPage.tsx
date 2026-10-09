import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { useRouter, Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Project } from '../../types.ts';
import {
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Star,
  Eye,
  AlertTriangle,
  FolderGit2,
} from 'lucide-react';

export const ProjectsListPage: React.FC = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Deletion modal state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProjects = () => {
    setLoading(true);
    api.getAdminProjects()
      .then(res => setProjects(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleToggleStatus = async (project: Project) => {
    try {
      const res = await api.toggleProjectStatus(project.id);
      setProjects(prev =>
        prev.map(p => (p.id === project.id ? { ...p, status: res.status } : p))
      );
      showToast(
        res.status === 'published'
          ? `Le projet "${project.title}" est maintenant publié en ligne !`
          : `Le projet "${project.title}" a été basculé en brouillon.`
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await api.deleteProject(projectToDelete.id);
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      showToast(`Projet "${projectToDelete.title}" supprimé avec succès.`);
      setProjectToDelete(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = projects.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.technologies.some(t => t.toLowerCase().includes(search.toLowerCase()));

    if (statusFilter === 'published') return matchSearch && p.status === 'published';
    if (statusFilter === 'draft') return matchSearch && p.status === 'draft';
    return matchSearch;
  });

  return (
    <AdminLayout
      title="Gestion des Projets"
      subtitle="Ajoutez, modifiez ou dépubliez vos réalisations en toute simplicité"
      actionButton={
        <Link
          to="/admin/projets/nouveau"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau projet</span>
        </Link>
      }
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, techno..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous ({projects.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'published'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Publiés ({projects.filter(p => p.status === 'published').length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'draft'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Brouillons ({projects.filter(p => p.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* Projects Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement des projets...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Aucun projet trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Commencez par ajouter votre première réalisation pour l'afficher sur votre portfolio.
          </p>
          <Link
            to="/admin/projets/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter mon premier projet</span>
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Projet</th>
                  <th className="px-6 py-4">Catégorie & Technos</th>
                  <th className="px-6 py-4">Année</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(proj => (
                  <tr key={proj.id} className="hover:bg-slate-800/30 transition">
                    {/* Project info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.mainImage}
                          alt={proj.title}
                          className="w-14 h-11 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-950"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{proj.title}</span>
                            {proj.featured && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Star className="w-3 h-3 fill-amber-400" />
                                À la une
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                            {proj.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Techs */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-indigo-400 block">
                          {proj.category}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.slice(0, 3).map(t => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                          {proj.technologies.length > 3 && (
                            <span className="text-[10px] text-slate-400">
                              +{proj.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Year */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{proj.year}</td>

                    {/* Status switch */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(proj)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                          proj.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                        title="Cliquer pour changer de statut"
                      >
                        {proj.status === 'published' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Publié</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Brouillon</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Live / Preview Link */}
                        <Link
                          to={`/projets/${proj.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Voir le projet en ligne"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit Button */}
                        <Link
                          to={`/admin/projets/edit/${proj.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 transition"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => setProjectToDelete(proj)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-slate-300 text-center mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement le projet{' '}
              <strong className="text-white font-semibold">"{projectToDelete.title}"</strong> ? Cette action est irréversible.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
