import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/public/Navbar.tsx';
import { Footer } from '../../components/public/Footer.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Profile } from '../../types.ts';
import { Mail, Phone, MapPin, Send, CheckCircle, Github, Linkedin, Twitter, Globe, Terminal } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    api.getProfile().then(res => setProfile(res)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Veuillez remplir votre nom, votre email et votre message.', 'error');
      return;
    }

    setSending(true);
    try {
      const res = await api.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setSentSuccess(true);
      showToast(res.message);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar availableForWork={profile?.availableForWork} profile={profile} />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Prendre Contact
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Parlons de votre projet
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">
              Que ce soit pour une mission de développement, un audit d'architecture ou un contrat longue durée, je suis à votre écoute.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Info Col */}
            <div className="lg:col-span-5 space-y-8">
              {/* Profile Card with Photo */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
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
                        <Terminal className="w-6 h-6 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                      <span>{profile?.name || 'KAGAMBEGA RENE'}</span>
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    </h3>
                    <p className="text-xs text-indigo-400 font-mono">
                      {profile?.title || 'Ingénieur en Informatique'}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>En ligne & réactif</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed border-t border-slate-800/80 pt-3">
                  N'hésitez pas à me contacter directement par email, téléphone ou via le formulaire ci-contre. Je m'engage à vous répondre sous 24h ouvrées.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                  Coordonnées directes
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-mono">Email</span>
                      <a
                        href={`mailto:${profile?.email || 'contact@alexandre-mercier.dev'}`}
                        className="text-sm font-semibold text-white hover:text-indigo-400 transition"
                      >
                        {profile?.email || 'contact@alexandre-mercier.dev'}
                      </a>
                    </div>
                  </div>

                  {profile?.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-mono">Téléphone</span>
                        <span className="text-sm font-semibold text-white">{profile.phone}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-mono">Localisation</span>
                      <span className="text-sm font-semibold text-white">
                        {profile?.location || 'Paris, France (Disponible en remote)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social networks card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                  Réseaux professionnels
                </h3>
                <div className="flex items-center gap-3">
                  {profile?.social?.github && (
                    <a
                      href={profile.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                      title="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.social?.linkedin && (
                    <a
                      href={profile.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-400 transition"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.social?.twitter && (
                    <a
                      href={profile.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition"
                      title="Twitter / X"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Form Col */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              {sentSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message transmis avec succès !</h3>
                  <p className="text-sm text-slate-300 max-w-sm mx-auto">
                    Votre message a bien été enregistré. Je reviens vers vous par email très rapidement.
                  </p>
                  <button
                    onClick={() => setSentSuccess(false)}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition"
                  >
                    Envoyer un nouveau message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                        Votre Nom complet <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="ex: Alexandre Dupont"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                        Votre Adresse Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="alexandre@entreprise.fr"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                      Sujet de la demande
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Mission Architecture / Audit / Lead Tech"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                      Votre Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Décrivez vos besoins, délais ou technologies souhaitées..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Transmission...' : 'Envoyer mon message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer profile={profile || undefined} />
    </div>
  );
};
