import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Profile } from '../../types.ts';
import { Save, User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, FileText, Upload } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    name: '',
    title: '',
    tagline: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    availableForWork: true,
    avatarUrl: '',
    resumeUrl: '',
    social: {
      github: '',
      linkedin: '',
      twitter: '',
      website: '',
    },
  });

  useEffect(() => {
    api.getProfile()
      .then(res => setProfile(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(profile);
      showToast('Profil professionnel mis à jour avec succès !');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const uploaded = await api.uploadMedia({
          fileName: file.name,
          fileData,
          mimeType: file.type,
        });
        setProfile(prev => ({ ...prev, avatarUrl: uploaded.url }));
        showToast('Photo de profil mise à jour !');
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const uploaded = await api.uploadMedia({
          fileName: file.name,
          fileData,
          mimeType: file.type,
        });
        setProfile(prev => ({ ...prev, resumeUrl: uploaded.url }));
        showToast('Fichier CV PDF mis à jour !');
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AdminLayout
      title="Profil & Coordonnées"
      subtitle="Gérez vos informations publiques, présentation, réseaux et CV téléchargeable"
    >
      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement du profil...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Main Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Identité & Présentation</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="space-y-3 shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-slate-950 border-2 border-indigo-500/30 overflow-hidden shadow-lg relative group">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== window.location.origin + '/images/rene_avatar.jpg') {
                          target.src = '/images/rene_avatar.jpg';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                      <User className="w-10 h-10 mb-1" />
                      <span className="text-[10px]">Aucune photo</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs cursor-pointer transition">
                    <Upload className="w-5 h-5 mb-1 text-cyan-400" />
                    <span>Changer</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>

                <label className="block text-center px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-white cursor-pointer transition">
                  Téléverser fichier
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Titre professionnel
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.title}
                    onChange={e => setProfile({ ...profile, title: e.target.value })}
                    placeholder="ex: Ingénieur en Informatique & Architecte Logiciel"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    URL ou chemin de la photo de profil
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profile.avatarUrl}
                      onChange={e => setProfile({ ...profile, avatarUrl: e.target.value })}
                      placeholder="/uploads/... ou https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Vous pouvez téléverser une photo ci-dessus ou saisir directement une URL externe / chemin relatif.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Accroche (Tagline Hero)
                  </label>
                  <input
                    type="text"
                    value={profile.tagline}
                    onChange={e => setProfile({ ...profile, tagline: e.target.value })}
                    placeholder="Courte phrase percutante pour le haut de page"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Biographie détaillée
              </label>
              <textarea
                rows={5}
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Votre parcours, vos spécialités et votre philosophie de développement..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.availableForWork}
                  onChange={e => setProfile({ ...profile, availableForWork: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium">
                  Afficher le badge "Disponible pour de nouveaux projets / missions"
                </span>
              </label>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Coordonnées & CV</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Email public
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Localisation
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Lien ou Fichier du CV
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={profile.resumeUrl}
                  onChange={e => setProfile({ ...profile, resumeUrl: e.target.value })}
                  placeholder="URL du CV ou téléversez ci-contre"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Téléverser PDF</span>
                  <input type="file" accept=".pdf" onChange={handleCvUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Réseaux Professionnels</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  GitHub
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={profile.social?.github || ''}
                    onChange={e =>
                      setProfile({
                        ...profile,
                        social: { ...profile.social, github: e.target.value },
                      })
                    }
                    placeholder="https://github.com/mon-compte"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  LinkedIn
                </label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={profile.social?.linkedin || ''}
                    onChange={e =>
                      setProfile({
                        ...profile,
                        social: { ...profile.social, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/in/mon-profil"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Twitter / X
                </label>
                <div className="relative">
                  <Twitter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={profile.social?.twitter || ''}
                    onChange={e =>
                      setProfile({
                        ...profile,
                        social: { ...profile.social, twitter: e.target.value },
                      })
                    }
                    placeholder="https://twitter.com/mon-compte"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Site Web Personnel
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={profile.social?.website || ''}
                    onChange={e =>
                      setProfile({
                        ...profile,
                        social: { ...profile.social, website: e.target.value },
                      })
                    }
                    placeholder="https://alexandre-mercier.dev"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer le profil'}</span>
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
};
