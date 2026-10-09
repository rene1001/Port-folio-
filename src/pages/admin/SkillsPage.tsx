import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Skill } from '../../types.ts';
import { Plus, Edit, Trash2, Cpu, Check, X, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Frontend',
  'Backend',
  'Bases de données',
  'DevOps & Outils',
  'Architecture & IA',
];

export const SkillsPage: React.FC = () => {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create/edit
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState(85);
  const [order, setOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  const loadSkills = () => {
    setLoading(true);
    api.getAdminSkills()
      .then(res => setSkills(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const openCreateModal = () => {
    setEditingSkill(null);
    setName('');
    setCategory(CATEGORIES[0]);
    setLevel(85);
    setOrder(skills.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setLevel(skill.level);
    setOrder(skill.order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Le nom de la compétence est obligatoire', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingSkill) {
        await api.updateSkill(editingSkill.id, {
          name: name.trim(),
          category,
          level,
          order,
        });
        showToast(`Compétence "${name}" mise à jour !`);
      } else {
        await api.createSkill({
          name: name.trim(),
          category,
          level,
          order,
          status: 'active',
        });
        showToast(`Compétence "${name}" ajoutée avec succès !`);
      }
      setIsModalOpen(false);
      loadSkills();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skill: Skill) => {
    if (!confirm(`Supprimer la compétence "${skill.name}" ?`)) return;
    try {
      await api.deleteSkill(skill.id);
      setSkills(skills.filter(s => s.id !== skill.id));
      showToast(`Compétence "${skill.name}" supprimée.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AdminLayout
      title="Compétences & Technologies"
      subtitle="Organisez vos savoir-faire techniques par catégorie avec niveaux de maîtrise"
      actionButton={
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle compétence</span>
        </button>
      }
    >
      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement...</div>
      ) : (
        <div className="space-y-8">
          {CATEGORIES.map(cat => {
            const catSkills = skills.filter(s => s.category.toLowerCase() === cat.toLowerCase());
            if (catSkills.length === 0) return null;

            return (
              <div key={cat} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>{cat}</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {catSkills.length} compétence{catSkills.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catSkills.map(sk => (
                    <div
                      key={sk.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white text-sm">{sk.name}</span>
                          <span className="text-xs font-mono font-bold text-indigo-400">{sk.level}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                            style={{ width: `${sk.level}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>Ordre: {sk.order}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(sk)}
                            className="p-1 text-slate-400 hover:text-indigo-400 transition"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sk)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSkill ? 'Modifier la compétence' : 'Ajouter une compétence'}
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
                  Nom de la technologie
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: React, Docker, MySQL..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-300">
                    Niveau de maîtrise
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-400">{level}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={level}
                  onChange={e => setLevel(Number(e.target.value))}
                  className="w-full accent-indigo-500"
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
