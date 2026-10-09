import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { ContactMessage } from '../../types.ts';
import {
  Mail,
  MailOpen,
  CheckCircle,
  Trash2,
  Calendar,
  User,
  Reply,
  AlertCircle,
  Search,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'resolved'>('all');
  const [search, setSearch] = useState('');

  const loadMessages = () => {
    setLoading(true);
    api.getAdminMessages()
      .then(res => setMessages(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'unread' | 'read' | 'resolved') => {
    try {
      await api.updateMessageStatus(id, status);
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, status } : m)));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
      showToast('Statut du message mis à jour');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement ce message ?')) return;
    try {
      await api.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      showToast('Message supprimé');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filtered = messages.filter(m => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    if (filter === 'all') return matchSearch;
    return matchSearch && m.status === filter;
  });

  return (
    <AdminLayout
      title="Boîte de Réception"
      subtitle="Consultez et traitez les messages reçus depuis le formulaire de contact"
    >
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher expéditeur, email, objet..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'unread'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Non lus ({messages.filter(m => m.status === 'unread').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'resolved'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Traités ({messages.filter(m => m.status === 'resolved').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement des messages...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <Mail className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">Aucun message trouvé</h3>
          <p className="text-xs text-slate-400 mt-1">Votre boîte est propre et à jour.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List col */}
          <div className="lg:col-span-5 space-y-2">
            {filtered.map(msg => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === 'unread') {
                      handleUpdateStatus(msg.id, 'read');
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/80 shadow-md'
                      : msg.status === 'unread'
                      ? 'bg-slate-900/90 border-rose-800/40 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-800/60 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {msg.status === 'unread' && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      )}
                      <span className="font-bold text-white text-sm truncate">{msg.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-300 truncate">{msg.subject}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{msg.message}</p>
                </div>
              );
            })}
          </div>

          {/* Details col */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[400px]">
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedMessage.subject}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>De : <strong className="text-slate-200">{selectedMessage.name}</strong></span>
                      <span>({selectedMessage.email})</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        selectedMessage.status === 'unread'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : selectedMessage.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {selectedMessage.status === 'unread'
                        ? 'Non lu'
                        : selectedMessage.status === 'resolved'
                        ? 'Traité'
                        : 'Lu'}
                    </span>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Reçu le{' '}
                    {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    {selectedMessage.status !== 'resolved' ? (
                      <button
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'resolved')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Marquer comme traité</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition"
                      >
                        <MailOpen className="w-3.5 h-3.5" />
                        <span>Remettre en lu</span>
                      </button>
                    )}
                  </div>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Répondre par email ({selectedMessage.email})</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 text-slate-500">
                <Mail className="w-10 h-10 mb-2 text-slate-600" />
                <p className="text-sm">Sélectionnez un message dans la liste pour lire son contenu.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
