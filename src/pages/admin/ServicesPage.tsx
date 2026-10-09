import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Service } from '../../types.ts';
import { Plus, Edit, Trash2, Briefcase, X, Cpu, Globe, Database, Cloud } from 'lucide-react';

const ICON_OPTIONS = ['Cpu', 'Globe', 'Database', 'Cloud', 'Code', 'Shield', 'Layers', 'Server'];

export const ServicesPage: React.FC = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Cpu');
  const [order, setOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  const loadServices = () => {
    setLoading(true);
    api.getAdminServices()
      .then(res => setServices(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setTitle('');
    setDescription('');
    setIcon('Cpu');
    setOrder(services.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (srv: Service) => {
    setEditingService(srv);
    setTitle(srv.title);
    setDescription(srv.description);
    setIcon(srv.icon || 'Cpu');
    setOrder(srv.order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Le titre et la description sont requis', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingService) {
        await api.updateService(editingService.id, {
          title: title.trim(),
          description: description.trim(),
          icon,
          order,
        });
        showToast(`Service "${title}" mis à jour !`);
      } else {
        await api.createService({
          title: title.trim(),
          description: description.trim(),
          icon,
          order,
          status: 'active',
        });
        showToast(`Service "${title}" ajouté avec succès !`);
      }
      setIsModalOpen(false);
      loadServices();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (srv: Service) => {
    if (!confirm(`Supprimer le service "${srv.title}" ?`)) return;
    try {
      await api.deleteService(srv.id);
      setServices(services.filter(s => s.id !== srv.id));
      showToast(`Service supprimé.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AdminLayout
      title="Services Proposés"
      subtitle="Définissez les prestations techniques et missions d'ingénierie que vous proposez"
      actionButton={
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau service</span>
        </button>
      }
    >
      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement des services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(srv => (
            <div
              key={srv.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">Ordre : {srv.order}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{srv.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{srv.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(srv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleDelete(srv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/30 text-rose-300 hover:bg-rose-950/50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingService ? 'Modifier le service' : 'Ajouter un service'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Titre du service
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="ex: Architecture & Ingénierie Logicielle"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Description détaillée
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Expliquez ce que vous apportez à vos clients..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={e => setOrder(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
