import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Experience, Education } from '../../types.ts';
import {
  Briefcase,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  X,
  Check,
} from 'lucide-react';

export const ParcoursPage: React.FC = () => {
  const { showToast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  // Experience modal
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expTechs, setExpTechs] = useState<string[]>([]);
  const [expTechInput, setExpTechInput] = useState('');

  // Education modal
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [eduDegree, setEduDegree] = useState('');
  const [eduSchool, setEduSchool] = useState('');
  const [eduLocation, setEduLocation] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');
  const [eduDesc, setEduDesc] = useState('');

  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getAdminExperiences(), api.getAdminEducations()])
      .then(([expRes, eduRes]) => {
        setExperiences(expRes);
        setEducations(eduRes);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Experience Handlers
  const openExpModal = (exp?: Experience) => {
    if (exp) {
      setEditingExp(exp);
      setExpRole(exp.role);
      setExpCompany(exp.company);
      setExpLocation(exp.location);
      setExpStart(exp.startDate);
      setExpEnd(exp.endDate);
      setExpCurrent(exp.current);
      setExpDesc(exp.description);
      setExpTechs(exp.technologies || []);
    } else {
      setEditingExp(null);
      setExpRole('');
      setExpCompany('');
      setExpLocation('Paris, France');
      setExpStart('2024');
      setExpEnd('Présent');
      setExpCurrent(true);
      setExpDesc('');
      setExpTechs(['TypeScript', 'React']);
    }
    setIsExpModalOpen(true);
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Experience> = {
        role: expRole,
        company: expCompany,
        location: expLocation,
        startDate: expStart,
        endDate: expCurrent ? 'Présent' : expEnd,
        current: expCurrent,
        description: expDesc,
        technologies: expTechs,
      };

      if (editingExp) {
        await api.updateExperience(editingExp.id, payload);
        showToast('Expérience mise à jour !');
      } else {
        await api.createExperience(payload);
        showToast('Nouvelle expérience ajoutée !');
      }
      setIsExpModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!confirm('Supprimer cette expérience ?')) return;
    try {
      await api.deleteExperience(id);
      setExperiences(experiences.filter(e => e.id !== id));
      showToast('Expérience supprimée.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Education Handlers
  const openEduModal = (edu?: Education) => {
    if (edu) {
      setEditingEdu(edu);
      setEduDegree(edu.degree);
      setEduSchool(edu.school);
      setEduLocation(edu.location);
      setEduStart(edu.startDate);
      setEduEnd(edu.endDate);
      setEduDesc(edu.description);
    } else {
      setEditingEdu(null);
      setEduDegree('');
      setEduSchool('');
      setEduLocation('France');
      setEduStart('2020');
      setEduEnd('2023');
      setEduDesc('');
    }
    setIsEduModalOpen(true);
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Education> = {
        degree: eduDegree,
        school: eduSchool,
        location: eduLocation,
        startDate: eduStart,
        endDate: eduEnd,
        description: eduDesc,
      };

      if (editingEdu) {
        await api.updateEducation(editingEdu.id, payload);
        showToast('Formation mise à jour !');
      } else {
        await api.createEducation(payload);
        showToast('Nouvelle formation ajoutée !');
      }
      setIsEduModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEdu = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
    try {
      await api.deleteEducation(id);
      setEducations(educations.filter(e => e.id !== id));
      showToast('Formation supprimée.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AdminLayout
      title="Parcours & Formations"
      subtitle="Gérez la chronologie de vos expériences professionnelles et diplômes"
    >
      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement...</div>
      ) : (
        <div className="space-y-10">
          {/* Section Expériences */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Expériences Professionnelles</h3>
                  <p className="text-xs text-slate-400">Postes, missions et responsabilités clés</p>
                </div>
              </div>
              <button
                onClick={() => openExpModal()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map(exp => (
                <div
                  key={exp.id}
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{exp.role}</h4>
                      <span className="text-slate-500">@</span>
                      <span className="text-indigo-400 font-semibold">{exp.company}</span>
                      {exp.current && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Poste actuel
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {exp.startDate} — {exp.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {exp.location}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{exp.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.technologies?.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                    <button
                      onClick={() => openExpModal(exp)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 bg-slate-900 rounded-lg border border-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExp(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-lg border border-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Formations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Diplômes & Formations</h3>
                  <p className="text-xs text-slate-400">Écoles d'ingénieurs, universités et certifications</p>
                </div>
              </div>
              <button
                onClick={() => openEduModal()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-4">
              {educations.map(edu => (
                <div
                  key={edu.id}
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">{edu.degree}</h4>
                    <p className="text-sm font-semibold text-purple-400">{edu.school}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                      <span>{edu.startDate} — {edu.endDate}</span>
                      <span>{edu.location}</span>
                    </div>
                    {edu.description && (
                      <p className="text-sm text-slate-300 leading-relaxed max-w-2xl pt-1">
                        {edu.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                    <button
                      onClick={() => openEduModal(edu)}
                      className="p-1.5 text-slate-400 hover:text-purple-400 bg-slate-900 rounded-lg border border-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-lg border border-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-3">
              {editingExp ? 'Modifier l’expérience' : 'Ajouter une expérience'}
            </h3>
            <form onSubmit={handleSaveExp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Intitulé du poste</label>
                <input
                  type="text"
                  required
                  value={expRole}
                  onChange={e => setExpRole(e.target.value)}
                  placeholder="ex: Architecte Logiciel Senior"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Entreprise</label>
                  <input
                    type="text"
                    required
                    value={expCompany}
                    onChange={e => setExpCompany(e.target.value)}
                    placeholder="Nom société"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={expLocation}
                    onChange={e => setExpLocation(e.target.value)}
                    placeholder="Paris & Remote"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Date début</label>
                  <input
                    type="text"
                    value={expStart}
                    onChange={e => setExpStart(e.target.value)}
                    placeholder="2023-01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Date fin</label>
                  <input
                    type="text"
                    disabled={expCurrent}
                    value={expCurrent ? 'Présent' : expEnd}
                    onChange={e => setExpEnd(e.target.value)}
                    placeholder="2024-12"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white disabled:opacity-50"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expCurrent}
                  onChange={e => setExpCurrent(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>J'occupe actuellement ce poste</span>
              </label>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  placeholder="Missions réalisées, impact technique..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-3">
              {editingEdu ? 'Modifier la formation' : 'Ajouter une formation'}
            </h3>
            <form onSubmit={handleSaveEdu} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Diplôme / Certification</label>
                <input
                  type="text"
                  required
                  value={eduDegree}
                  onChange={e => setEduDegree(e.target.value)}
                  placeholder="ex: Diplôme d’Ingénieur en Informatique"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Établissement</label>
                  <input
                    type="text"
                    required
                    value={eduSchool}
                    onChange={e => setEduSchool(e.target.value)}
                    placeholder="École / Université"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Lieu</label>
                  <input
                    type="text"
                    value={eduLocation}
                    onChange={e => setEduLocation(e.target.value)}
                    placeholder="Paris, France"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Année début</label>
                  <input
                    type="text"
                    value={eduStart}
                    onChange={e => setEduStart(e.target.value)}
                    placeholder="2016"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Année fin</label>
                  <input
                    type="text"
                    value={eduEnd}
                    onChange={e => setEduEnd(e.target.value)}
                    placeholder="2019"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description / Mention</label>
                <textarea
                  rows={3}
                  value={eduDesc}
                  onChange={e => setEduDesc(e.target.value)}
                  placeholder="Spécialisation, mention, projets académiques..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEduModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
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
