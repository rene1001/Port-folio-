import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/public/Navbar.tsx';
import { Footer } from '../../components/public/Footer.tsx';
import { useRouter, Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import type { Project, Profile } from '../../types.ts';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Maximize2,
  X,
  Share2,
} from 'lucide-react';

interface ProjectDetailPageProps {
  slug: string;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getProjectBySlug(slug), api.getProfile()])
      .then(([projRes, profRes]) => {
        setProject(projRes);
        setProfile(profRes);
      })
      .catch(() => {
        navigate('/projets');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Chargement du projet...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar availableForWork={profile?.availableForWork} profile={profile} />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Back link */}
          <Link
            to="/projets"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à tous les projets</span>
          </Link>

          {/* Header & Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-mono">
                {project.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">{project.year}</span>
              {project.client && (
                <span className="text-xs text-slate-400 font-mono">• Client: {project.client}</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
              {project.shortDescription}
            </p>

            {/* Live and GitHub Links */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visiter le projet en ligne</span>
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-2 border border-slate-800 transition"
                >
                  <Github className="w-4 h-4" />
                  <span>Voir le code source GitHub</span>
                </a>
              )}
            </div>
          </div>

          {/* Main Hero Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative group">
            <img
              src={project.mainImage}
              alt={project.title}
              className="w-full h-[360px] sm:h-[480px] object-cover"
            />
            <button
              onClick={() => setLightboxImage(project.mainImage)}
              className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/70 hover:bg-black text-white text-xs flex items-center gap-1.5 transition opacity-0 group-hover:opacity-100"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Agrandir</span>
            </button>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Rôle</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{project.role || 'Développeur Principal'}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Année</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{project.year}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Catégorie</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{project.category}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Statut</span>
              <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">Livré & Opérationnel</span>
            </div>
          </div>

          {/* Problem & Solution Architecture */}
          {(project.problem || project.solution) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.problem && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold text-white text-base">La Problématique</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{project.problem}</p>
                </div>
              )}

              {project.solution && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-white text-base">La Solution Apportée</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{project.solution}</p>
                </div>
              )}
            </div>
          )}

          {/* Full Description */}
          {project.fullDescription && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Détails de l'Architecture & Conception</h2>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-base">
                {project.fullDescription}
              </div>
            </div>
          )}

          {/* Key Features */}
          {project.features && project.features.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Fonctionnalités Clés Développées</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-sm text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Stack Technique Utilisée</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map(t => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-200 border border-slate-800"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Image Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Captures d'écran & Galerie</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.gallery.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxImage(img)}
                    className="h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer group relative"
                  >
                    <img
                      src={img}
                      alt={`${project.title} screenshot ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Zoom"
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <Footer profile={profile || undefined} />
    </div>
  );
};
