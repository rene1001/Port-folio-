import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/public/Navbar.tsx';
import { Footer } from '../../components/public/Footer.tsx';
import { useRouter, Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Profile, Project, Post, Skill, Service } from '../../types.ts';
import {
  ArrowRight,
  Download,
  Mail,
  FolderGit2,
  FileText,
  ExternalLink,
  Github,
  Calendar,
  Clock,
  Sparkles,
  Cpu,
  Layers,
  ChevronRight,
  Send,
  CheckCircle,
  Star,
  Terminal,
  Shield,
  Activity,
  Award,
  User,
  MapPin,
  Briefcase,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroTab, setHeroTab] = useState<'photo' | 'terminal'>('photo');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getProfile(),
      api.getProjects(),
      api.getPosts(),
      api.getSkills(),
      api.getServices(),
    ])
      .then(([profRes, projRes, postRes, skillRes, servRes]) => {
        setProfile(profRes);
        setProjects(projRes);
        setPosts(postRes);
        setSkills(skillRes);
        setServices(servRes);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    setSending(true);
    try {
      const res = await api.sendContactMessage({
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
      });
      setSentSuccess(true);
      showToast(res.message);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const skillCategories = Array.from(new Set(skills.map(s => s.category)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar availableForWork={profile?.availableForWork} profile={profile} />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Titles & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {profile?.avatarUrl && (
                  <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm">
                    <img
                      src={profile.avatarUrl}
                      alt={profile?.name || 'Photo de profil'}
                      className="w-5 h-5 rounded-full object-cover border border-indigo-400/50"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="font-semibold text-slate-200">{profile?.name || 'KAGAMBEGA RENE'}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-indigo-400 font-mono">Ingénieur Logiciel</span>
                  </div>
                )}

                {profile?.availableForWork && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Disponible pour missions & CDI</span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Bonjour, je suis{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">
                  {profile?.name || 'KAGAMBEGA RENE'}
                </span>
              </h1>

              <p className="text-xl sm:text-2xl font-semibold text-slate-200 font-mono tracking-tight">
                {profile?.title || 'Ingénieur en Informatique & Architecte Logiciel'}
              </p>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                {profile?.tagline ||
                  "Je conçois des systèmes distribués robustes, des APIs performantes et des interfaces web modernes à forte valeur ajoutée."}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/projets"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition active:scale-95 flex items-center gap-2"
                >
                  <span>Voir mes projets</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/contact"
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Me contacter</span>
                </Link>

                {profile?.resumeUrl && profile.resumeUrl !== '#' && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Télécharger CV</span>
                  </a>
                )}
              </div>

              {/* Key Technical Highlights */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">6+</div>
                  <div className="text-xs text-slate-400 mt-0.5">Années d'expérience</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">25+</div>
                  <div className="text-xs text-slate-400 mt-0.5">Projets livrés</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">15M+</div>
                  <div className="text-xs text-slate-400 mt-0.5">Req/jour gérées</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">99.9%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Taux de disponibilité</div>
                </div>
              </div>
            </div>

            {/* Right Col: Personal Photo Showcase with interactive Tab Switcher */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-500/20 blur-xl opacity-75" />

                {/* Main Card Container */}
                <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  {/* Card Header with View Switcher */}
                  <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setHeroTab('photo')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          heroTab === 'photo'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Photo de profil</span>
                      </button>
                      <button
                        onClick={() => setHeroTab('terminal')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          heroTab === 'terminal'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Console code</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-mono text-emerald-400 font-medium">Actif</span>
                    </div>
                  </div>

                  {/* TAB 1: PERSONAL PHOTO DISPLAY */}
                  {heroTab === 'photo' && (
                    <div className="relative p-4 sm:p-5">
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
                        {profile?.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile?.name || 'Photo de profil'}
                            className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (target.src !== window.location.origin + '/images/rene_avatar.jpg') {
                                target.src = '/images/rene_avatar.jpg';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/40 to-slate-950 p-6 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                              <User className="w-10 h-10" />
                            </div>
                            <span className="text-sm font-bold text-white">{profile?.name || 'KAGAMBEGA RENE'}</span>
                            <span className="text-xs text-slate-400 mt-1">{profile?.title || 'Ingénieur Logiciel'}</span>
                          </div>
                        )}

                        {/* Top floating availability badge */}
                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-400 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>Prêt pour nouveaux projets</span>
                        </div>

                        {/* Bottom overlay card */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent pt-12 pb-4 px-4 text-left">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                                <span>{profile?.name || 'KAGAMBEGA RENE'}</span>
                                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                              </h3>
                              <p className="text-xs text-slate-300 font-mono mt-0.5 line-clamp-1">
                                {profile?.title || 'Ingénieur en Informatique & Architecte Logiciel'}
                              </p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                6+ Ans Exp.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tech stack highlight pills below photo */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="line-clamp-1">{profile?.location || 'Paris, France / Remote'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-[11px] font-mono text-cyan-400 border border-slate-800">TypeScript</span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-[11px] font-mono text-indigo-400 border border-slate-800">React</span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-[11px] font-mono text-amber-400 border border-slate-800">PHP/SQL</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TERMINAL CODE VIEW */}
                  {heroTab === 'terminal' && (
                    <div>
                      <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>Terminal interactif</span>
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="p-6 font-mono text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                        <div className="text-slate-400">
                          <span className="text-emerald-400">$</span> cat profile.json
                        </div>
                        <div className="text-indigo-300">
                          {`{`}
                          <br />
                          &nbsp;&nbsp;<span className="text-cyan-400">"nom"</span>: <span className="text-amber-300">"{profile?.name || 'KAGAMBEGA RENE'}"</span>,
                          <br />
                          &nbsp;&nbsp;<span className="text-cyan-400">"statut"</span>: <span className="text-amber-300">"Ingénieur Logiciel Senior"</span>,
                          <br />
                          &nbsp;&nbsp;<span className="text-cyan-400">"spécialité"</span>: <span className="text-amber-300">"Systèmes Distribués & Web"</span>,
                          <br />
                          &nbsp;&nbsp;<span className="text-cyan-400">"stack"</span>: [
                          <br />
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-300">"TypeScript"</span>, <span className="text-amber-300">"React"</span>, <span className="text-amber-300">"Node.js"</span>,
                          <br />
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-300">"Laravel"</span>, <span className="text-amber-300">"MySQL"</span>, <span className="text-amber-300">"Docker"</span>
                          <br />
                          &nbsp;&nbsp;],
                          <br />
                          &nbsp;&nbsp;<span className="text-cyan-400">"architecture"</span>: <span className="text-emerald-400">"Clean Architecture & Microservices"</span>
                          <br />
                          {`}`}
                        </div>
                        <div className="pt-2 text-slate-400">
                          <span className="text-emerald-400">$</span> devportfolio status
                          <br />
                          <span className="text-emerald-400">✔</span> Système opérationnel — Tous les services sont au vert.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SHORT SECTION WITH PROFILE PHOTO */}
      <section className="py-20 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Photo Portrait Card */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-cyan-500/20 to-purple-500/20 blur-xl" />
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-3 shadow-2xl">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile?.name || 'Portrait de profil'}
                        className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== window.location.origin + '/images/rene_avatar.jpg') {
                            target.src = '/images/rene_avatar.jpg';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
                        <User className="w-16 h-16 text-indigo-400 mb-2" />
                        <span className="font-semibold text-white">{profile?.name}</span>
                      </div>
                    )}

                    {/* Gradient Overlay & Details */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-5 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                          Profil ingénieur vérifié
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white tracking-tight">
                        {profile?.name || 'KAGAMBEGA RENE'}
                      </h4>
                      <p className="text-xs text-slate-300 font-mono mt-0.5 line-clamp-1">
                        {profile?.title || 'Ingénieur en Informatique & Architecte Logiciel'}
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="line-clamp-1">{profile?.location?.split('(')[0] || 'Paris, France'}</span>
                        </span>
                        <span className="text-indigo-400 font-semibold font-mono">Expert Logiciel</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: About Content & Pillars */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                À propos de moi
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                L'excellence technique & la rigueur logicielle au service de vos ambitions
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                {profile?.bio ||
                  "Diplômé d'école d'ingénieurs avec une solide maîtrise de la programmation et du génie logiciel, je conçois des applications prêtes pour la production, scalables et testées avec rigueur."}
              </p>

              {/* Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Clean Architecture</h4>
                  <p className="text-xs text-slate-400">Code modulaire, découplé et maintenable sur le long terme.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Haute Performance</h4>
                  <p className="text-xs text-slate-400">APIs véloces, requêtes SQL affinées et mise en cache optimale.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Fiabilité & Tests</h4>
                  <p className="text-xs text-slate-400">Tests automatisés, intégration continue et zéro régression.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/a-propos"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition active:scale-95"
                >
                  <span>Découvrir mon parcours complet & formations</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition"
                >
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Démarrer un projet</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="py-20 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                Compétences
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Technologies & Savoir-Faire
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Des technologies modernes maîtrisées pour assurer la rapidité, la fiabilité et la sécurité de votre produit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map(cat => {
              const catSkills = skills.filter(s => s.category.toLowerCase() === cat.toLowerCase());
              return (
                <div
                  key={cat}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>{cat}</span>
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {catSkills.map(sk => (
                      <div key={sk.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{sk.name}</span>
                          <span className="font-mono text-indigo-400 font-bold">{sk.level}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                            style={{ width: `${sk.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS SECTION */}
      <section className="py-20 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                Portfolio
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Derniers Projets Réalisés
              </h2>
            </div>
            <Link
              to="/projets"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            >
              <span>Voir tous mes projets ({projects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 3).map(proj => (
              <div
                key={proj.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/5 transition duration-300"
              >
                <div>
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={proj.mainImage}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {proj.featured && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/90 text-slate-950 flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-slate-950" />
                          À la une
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
                        {proj.year}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <span className="text-xs font-semibold text-indigo-400 block font-mono">
                      {proj.category}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                      <Link to={`/projets/${proj.slug}`}>{proj.title}</Link>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {proj.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.technologies.slice(0, 4).map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {t}
                        </span>
                      ))}
                      {proj.technologies.length > 4 && (
                        <span className="text-[11px] text-slate-400">+{proj.technologies.length - 4}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <Link
                    to={`/projets/${proj.slug}`}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 group/btn"
                  >
                    <span>Découvrir le projet</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  <div className="flex items-center gap-2">
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition"
                        title="Visiter le site en ligne"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {proj.github && (
                      <a
                        href={proj.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition"
                        title="Voir le code GitHub"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Services & Prestations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ce que je peux apporter à votre entreprise
            </h2>
            <p className="text-slate-400 text-sm">
              Accompagnement technique de bout en bout, de l'architecture initiale jusqu'au déploiement et à la scalabilité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(srv => (
              <div
                key={srv.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-5">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{srv.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{srv.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST BLOG POSTS SECTION */}
      <section className="py-20 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Publications
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Derniers Articles de Blog
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            >
              <span>Tous les articles ({posts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.slice(0, 3).map(post => (
              <article
                key={post.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition"
              >
                <div>
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={post.mainImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {post.readingTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-800/80 mt-4">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 group/btn"
                  >
                    <span>Lire l'article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                Contact
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Discutons de votre prochain projet
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Vous avez un projet d'envergure, une mission d'architecture logicielle ou besoin d'un renfort technique senior ?
                Envoyez-moi un message via ce formulaire ou directement par email.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-mono">Email direct</span>
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
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-mono">Téléphone</span>
                      <span className="text-sm font-semibold text-white">{profile.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              {sentSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message envoyé avec succès !</h3>
                  <p className="text-sm text-slate-300 max-w-sm mx-auto">
                    Merci pour votre prise de contact. Je vous répondrai dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setSentSuccess(false)}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                        Votre nom <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="Sophie Laurent"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                        Votre email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="sophie@entreprise.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                      Sujet de votre demande
                    </label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={e => setContactSubject(e.target.value)}
                      placeholder="Projet de refonte d'API / Mission d'architecture"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      placeholder="Bonjour Alexandre, nous recherchons un ingénieur logiciel pour..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer profile={profile || undefined} />
    </div>
  );
};
