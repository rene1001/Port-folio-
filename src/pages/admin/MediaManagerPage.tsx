import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { MediaItem } from '../../types.ts';
import { Upload, Copy, Check, Trash2, Image as ImageIcon, FileText, ExternalLink, UserCheck } from 'lucide-react';

export const MediaManagerPage: React.FC = () => {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadMedia = () => {
    setLoading(true);
    api.getAdminMedia()
      .then(res => setMediaList(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Le fichier dépasse la taille maximale autorisée (10 Mo)', 'error');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const uploaded = await api.uploadMedia({
          fileName: file.name,
          fileData,
          mimeType: file.type,
        });
        setMediaList(prev => [uploaded, ...prev]);
        showToast(`Fichier "${file.name}" téléversé avec succès !`);
      } catch (err: any) {
        showToast(err.message, 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Lien du média copié dans le presse-papier !');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const setAsProfilePhoto = async (item: MediaItem) => {
    try {
      const prof = await api.getProfile();
      await api.updateProfile({ ...prof, avatarUrl: item.url });
      showToast(`"${item.name}" est désormais votre photo de profil !`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Supprimer le média "${item.name}" ?`)) return;
    try {
      await api.deleteMedia(item.id);
      setMediaList(prev => prev.filter(m => m.id !== item.id));
      showToast('Média supprimé avec succès.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout
      title="Médiathèque & Fichiers"
      subtitle="Stockez et réutilisez vos images, captures d'écran et documents PDF"
      actionButton={
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Téléversement...' : 'Téléverser un fichier'}</span>
          <input
            type="file"
            accept="image/*,.pdf"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      }
    >
      {/* Upload Drop Zone Banner */}
      <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-8 mb-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">
          Glissez-déposez un fichier ou cliquez sur le bouton
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Formats acceptés : JPG, PNG, WebP, SVG, PDF (CV). Taille maximale : 10 Mo.
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer border border-slate-700">
          <span>Sélectionner depuis l'ordinateur</span>
          <input
            type="file"
            accept="image/*,.pdf"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement des médias...</div>
      ) : mediaList.length === 0 ? (
        <p className="text-center text-slate-500 py-12">Aucun média téléversé pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map(item => {
            const isImage = item.mimeType?.startsWith('image/');
            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition"
              >
                <div className="h-32 bg-slate-950 flex items-center justify-center overflow-hidden relative">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500">
                      <FileText className="w-8 h-8 text-indigo-400" />
                      <span className="text-[10px] font-mono">PDF</span>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-1.5">
                  <p className="text-xs font-medium text-white truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatFileSize(item.size)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                    <button
                      onClick={() => copyToClipboard(item.url, item.id)}
                      className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 transition"
                      title="Copier le lien"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier URL</span>
                        </>
                      )}
                    </button>
                    {isImage && (
                      <button
                        onClick={() => setAsProfilePhoto(item)}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                        title="Définir comme photo de profil"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};
