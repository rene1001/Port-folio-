import React from 'react';
import { Link } from '../../router/Router.tsx';
import { Terminal, Github, Linkedin, Twitter, Globe, Mail, MapPin, ArrowUp, Lock } from 'lucide-react';
import type { Profile } from '../../types.ts';

interface FooterProps {
  profile?: Profile | null;
}

export const Footer: React.FC<FooterProps> = ({ profile }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-slate-800/80">
          {/* Col 1 & 2: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-md overflow-hidden shrink-0">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile?.name || 'Photo de profil'}
                    className="w-full h-full object-cover rounded-[10px]"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== window.location.origin + '/images/rene_avatar.jpg') {
                        target.src = '/images/rene_avatar.jpg';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg tracking-tight">
                  {profile?.name || 'KAGAMBEGA RENE'}
                </h3>
                <p className="text-xs text-indigo-400 font-mono">
                  {profile?.title || 'Ingénieur en Informatique & Architecte Logiciel'}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Conception d'architectures résilientes, développement d'APIs performantes et réalisation d'applications web scalables de bout en bout.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{profile?.location || 'Paris, France (Disponible en remote)'}</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {profile?.social?.github && (
                <a
                  href={profile.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile?.social?.linkedin && (
                <a
                  href={profile.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-indigo-400 transition"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile?.social?.twitter && (
                <a
                  href={profile.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-400 transition"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              <a
                href={`mailto:${profile?.email || 'contact@alexandre-mercier.dev'}`}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-emerald-400 transition"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-white transition">
                  À propos & Parcours
                </Link>
              </li>
              <li>
                <Link to="/projets" className="hover:text-white transition">
                  Tous les projets
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition">
                  Articles & Publications
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Prendre contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Expertises */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-mono">
              Expertises
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>Architecture Microservices</li>
              <li>Développement Full-Stack</li>
              <li>APIs REST & GraphQL</li>
              <li>Optimisation MySQL & SQL</li>
              <li>DevOps & Déploiement Docker</li>
            </ul>
          </div>

          {/* Col 5: Disponibilité & Statut */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-mono">
              Disponibilité
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">Ouvert aux projets</span>
              </div>
              <p className="leading-relaxed">
                Disponible pour missions de conseil, architecture logicielle et développements full-stack.
              </p>
              <div className="pt-1">
                <span className="text-[11px] text-slate-500">Réponse sous 24h ouvrées</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} {profile?.name || 'KAGAMBEGA RENE'}. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link
              to="/admin"
              className="text-slate-600 hover:text-slate-400 transition p-1 rounded inline-flex items-center gap-1.5"
              title="Accès restreint"
              aria-label="Accès restreint"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[11px]">Accès privé</span>
            </Link>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Retour en haut de page"
            >
              <span>Haut de page</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
