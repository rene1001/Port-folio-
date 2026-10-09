import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/public/Navbar.tsx';
import { Footer } from '../../components/public/Footer.tsx';
import { Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import type { Profile, Experience, Education } from '../../types.ts';
import {
  Briefcase,
  GraduationCap,
  Download,
  Calendar,
  MapPin,
  CheckCircle,
  Award,
  Terminal,
  ArrowRight,
  User,
  Mail,
  Phone,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Shield,
  Activity,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProfile(), api.getExperiences(), api.getEducations()])
      .then(([prof, exp, edu]) => {
        setProfile(prof);
        setExperiences(exp);
        setEducations(edu);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar availableForWork={profile?.availableForWork} profile={profile} />

      <main className="flex-1 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header & Personal Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Big Portrait Photo Showcase */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500/25 via-purple-500/20 to-cyan-500/20 blur-xl" />
                
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 shadow-2xl space-y-4">
                  {/* Portrait photo */}
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile?.name || 'Photo de profil'}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== window.location.origin + '/images/rene_avatar.jpg') {
                            target.src = '/images/rene_avatar.jpg';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
                        <User className="w-20 h-20 text-indigo-400 mb-2" />
                        <span className="font-bold text-white">{profile?.name || 'KAGAMBEGA RENE'}</span>
                      </div>
                    )}

                    {/* Floating status */}
                    <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-400 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Disponible</span>
                    </div>

                    {/* Bottom overlay details */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-5 text-left">
                      <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{profile?.name || 'KAGAMBEGA RENE'}</span>
                        <CheckCircle className="w-4 h-4 text-cyan-400" />
                      </h3>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        {profile?.title || 'Ingénieur en Informatique & Architecte Logiciel'}
                      </p>
                    </div>
                  </div>

                  {/* Contact & Location details */}
                  <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{profile?.location || 'Paris, France (Disponible en remote)'}</span>
                    </div>

                    {profile?.email && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                        <a href={`mailto:${profile.email}`} className="truncate hover:text-white transition">
                          {profile.email}
                        </a>
                      </div>
                    )}

                    {profile?.phone && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Social links */}
                  <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-800/80">
                    {profile?.social?.github && (
                      <a
                        href={profile.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {profile?.social?.linkedin && (
                      <a
                        href={profile.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {profile?.social?.twitter && (
                      <a
                        href={profile.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {profile?.social?.website && (
                      <a
                        href={profile.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="Site web"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* CV Download button */}
                  {profile?.resumeUrl && profile.resumeUrl !== '#' && (
                    <div className="pt-2">
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger mon CV (PDF)</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Detailed Bio & Philosophy */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                Parcours & Philosophie
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                À propos de {profile?.name || 'KAGAMBEGA RENE'}
              </h1>
              
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-sm font-medium text-indigo-300">
                {profile?.tagline || "Concepteur de systèmes résilients, d'architectures scalables et d'applications modernes."}
              </div>

              <div className="space-y-4 text-slate-300 text-base leading-relaxed">
                <p>
                  {profile?.bio ||
                    "Ingénieur en informatique passionné par la conception de systèmes modulaires et la résolution de problématiques d'architecture complexes."}
                </p>
                <p className="text-slate-400 text-sm">
                  Je privilégie la clarté du code, la robustesse des modèles de données et l'efficacité des pipelines de déploiement. Que ce soit sur le design d'APIs REST microservices ou l'expérience utilisateur réactive sur React, mon objectif constant reste l'impact métier et la pérennité technique.
                </p>
              </div>

              {/* Technical Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Clean Architecture & DDD</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Découplage strict, inversion de dépendances et maintenabilité exemplaire.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Activity className="w-4 h-4" />
                    <span>Performance & Scalabilité</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Indexation MySQL avancée, mise en cache multi-niveaux et zéro goulot d'étranglement.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Qualité & Tests Rigoureux</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Tests unitaires, intégration continue automatisée et audits réguliers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Award className="w-4 h-4" />
                    <span>Veille & Innovation</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Adoption réfléchie des dernières technologies et patterns industriels.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/projets"
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                >
                  <span>Explorer mes projets</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/contact"
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition"
                >
                  Me contacter
                </Link>
              </div>
            </div>
          </div>

          {/* Timeline Expériences */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Expériences Professionnelles</h2>
                <p className="text-xs text-slate-400">Historique de mes rôles et responsabilités</p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-10">
              {experiences.map(exp => (
                <div key={exp.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white">
                        {exp.role} <span className="text-indigo-400">@ {exp.company}</span>
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {exp.startDate} — {exp.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {exp.location}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">{exp.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {exp.technologies?.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-xs bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline Formations */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Formations & Diplômes</h2>
                <p className="text-xs text-slate-400">Cursus académique et certifications</p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-10">
              {educations.map(edu => (
                <div key={edu.id} className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-purple-500 group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 hover:border-slate-700 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white">{edu.degree}</h3>
                      <span className="text-xs font-mono text-purple-400">
                        {edu.startDate} — {edu.endDate}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-300">{edu.school} — {edu.location}</p>
                    {edu.description && (
                      <p className="text-sm text-slate-400 leading-relaxed pt-1">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-800/40 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Prêt à collaborer ?</h3>
              <p className="text-sm text-slate-300 mt-1">Discutons de vos besoins et objectifs de charge.</p>
            </div>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shrink-0"
            >
              Me contacter maintenant
            </Link>
          </div>
        </div>
      </main>

      <Footer profile={profile || undefined} />
    </div>
  );
};
