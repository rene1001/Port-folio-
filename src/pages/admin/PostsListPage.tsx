import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { useRouter, Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Post } from '../../types.ts';
import {
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  AlertTriangle,
  FileText,
  Calendar,
} from 'lucide-react';

export const PostsListPage: React.FC = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    api.getAdminPosts()
      .then(res => setPosts(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleToggleStatus = async (post: Post) => {
    try {
      const res = await api.togglePostStatus(post.id);
      setPosts(prev =>
        prev.map(p => (p.id === post.id ? { ...p, status: res.status } : p))
      );
      showToast(
        res.status === 'published'
          ? `L’article "${post.title}" est maintenant publié en ligne !`
          : `L’article "${post.title}" a été basculé en brouillon.`
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    try {
      await api.deletePost(postToDelete.id);
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      showToast(`Article "${postToDelete.title}" supprimé avec succès.`);
      setPostToDelete(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = posts.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    if (statusFilter === 'published') return matchSearch && p.status === 'published';
    if (statusFilter === 'draft') return matchSearch && p.status === 'draft';
    return matchSearch;
  });

  return (
    <AdminLayout
      title="Articles & Blog Technique"
      subtitle="Gérez vos publications d'ingénierie, tutoriels et articles de fond"
      actionButton={
        <Link
          to="/admin/blog/nouveau"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel article</span>
        </Link>
      }
    >
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, tag..."
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
            Tous ({posts.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'published'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Publiés ({posts.filter(p => p.status === 'published').length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'draft'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Brouillons ({posts.filter(p => p.status === 'draft').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement des articles...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Aucun article trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Rédigez votre premier article technique pour partager vos retours d'expérience.
          </p>
          <Link
            to="/admin/blog/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            <Plus className="w-4 h-4" />
            <span>Rédiger mon premier article</span>
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Catégorie & Tags</th>
                  <th className="px-6 py-4">Date / Lecture</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.mainImage}
                          alt={post.title}
                          className="w-14 h-11 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-950"
                        />
                        <div>
                          <span className="font-bold text-white text-sm block">{post.title}</span>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-cyan-400 block">{post.category}</span>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map(t => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('fr-FR')
                            : 'Non publié'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{post.readingTime}</span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                          post.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                        title="Cliquer pour changer de statut"
                      >
                        {post.status === 'published' ? (
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

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Voir l'article en ligne"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/blog/edit/${post.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 transition"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setPostToDelete(post)}
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

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-slate-300 text-center mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement l'article{' '}
              <strong className="text-white font-semibold">"{postToDelete.title}"</strong> ?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPostToDelete(null)}
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
