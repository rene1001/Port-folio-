import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { SiteSettings } from '../../types.ts';
import { Settings, Lock, RotateCcw, Save, ShieldCheck, KeyRound } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: '',
    siteDescription: '',
    gaMeasurementId: '',
    maintenanceMode: false,
    primaryLanguage: 'fr',
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Reset database state
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then(res => setSettings(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.updateSettings(settings);
      showToast('Paramètres généraux enregistrés avec succès !');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Les nouveaux mots de passe ne correspondent pas', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Le mot de passe doit comporter au moins 6 caractères', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      showToast('Mot de passe administrateur modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('ATTENTION : Voulez-vous restaurer les données d’origine du portfolio ? Toutes les modifications non sauvegardées seront réinitialisées.')) {
      return;
    }

    setResetting(true);
    try {
      const res = await api.resetDatabase();
      showToast(res.message);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminLayout
      title="Paramètres & Sécurité"
      subtitle="Configuration générale du site et gestion des accès"
    >
      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement...</div>
      ) : (
        <div className="space-y-8">
          {/* General Site Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Paramètres Généraux du Portfolio</span>
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Titre du site
                </label>
                <input
                  type="text"
                  required
                  value={settings.siteTitle}
                  onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Description du portfolio
                </label>
                <textarea
                  rows={3}
                  value={settings.siteDescription}
                  onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Identifiant Google Analytics 4 (optionnel)
                </label>
                <input
                  type="text"
                  value={settings.gaMeasurementId}
                  onChange={e => setSettings({ ...settings, gaMeasurementId: e.target.value })}
                  placeholder="ex: G-XXXXXXXXXX (optionnel)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Admin Password Change */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-6 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Modifier le Mot de Passe Administrateur</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
              >
                <Lock className="w-4 h-4" />
                <span>{changingPassword ? 'Modification...' : 'Changer le mot de passe'}</span>
              </button>
            </form>
          </div>

          {/* Database Reset Danger Zone */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6">
            <h3 className="text-base font-bold text-rose-300 border-b border-rose-900/30 pb-3 mb-4 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Zone de Réinitialisation des Données</span>
            </h3>
            <p className="text-xs text-rose-200/80 leading-relaxed mb-4 max-w-xl">
              Vous avez la possibilité de restaurer les 3 projets de démonstration, les 3 articles techniques,
              les compétences et services initiaux créés pour le portfolio de l'ingénieur en informatique.
            </p>
            <button
              onClick={handleResetData}
              disabled={resetting}
              className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-semibold transition"
            >
              {resetting ? 'Réinitialisation en cours...' : 'Restaurer les données de démonstration'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
