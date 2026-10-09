import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { useRouter, Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Project } from '../../types.ts';
import {
  Save,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  ExternalLink,
  Layers,
  Sparkles,
  X,
  Globe,
  Github,
} from 'lucide-react';

interface ProjectFormPageProps {
  projectId?: string;
}

const COMMON_TECH_SUGGESTIONS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'Laravel',
  'PHP',
  'Python',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'Tailwind CSS',
  'AWS',
  'GraphQL',
  'Git',
];

const CATEGORIES = [
  'Architecture & SaaS',
  'E-commerce & Web',
  'DevOps & Sécurité',
  'Applications Mobiles',
  'APIs & Microservices',
  'Intelligence Artificielle',
  'Systèmes Embarqués & IoT',
];

export const ProjectFormPage: React.FC<ProjectFormPageProps> = ({ projectId }) => {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const isEditing = Boolean(projectId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [mainImage, setMainImage] = useState(
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
  );
  const [galleryInput, setGalleryInput] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [technologies, setTechnologies] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);
  const [techInput, setTechInput] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Architecture distribuée scalable',
    'Interface utilisateur réactive',
  ]);
  const [featureInput, setFeatureInput] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [client, setClient] = useState('');
  const [role, setRole] = useState('Ingénieur Logiciel');
  const [url, setUrl] = useState('');
  const [github, setGithub] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [featured, setFeatured] = useState(false);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Load existing project if editing
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      api.getAdminProjects()
        .then(projects => {
          const found = projects.find(p => p.id === projectId);
          if (found) {
            setTitle(found.title);
            setSlug(found.slug);
            setShortDescription(found.shortDescription);
            setFullDescription(found.fullDescription || '');
            setProblem(found.problem || '');
            setSolution(found.solution || '');
            setMainImage(found.mainImage || '');
            setGallery(found.gallery || []);
            setCategory(found.category || CATEGORIES[0]);
            setTechnologies(found.technologies || []);
            setFeatures(found.features || []);
            setYear(found.year || String(new Date().getFullYear()));
            setClient(found.client || '');
            setRole(found.role || '');
            setUrl(found.url || '');
            setGithub(found.github || '');
            setStatus(found.status || 'published');
            setFeatured(found.featured || false);
            setMetaTitle(found.metaTitle || '');
            setMetaDescription(found.metaDescription || '');
            setMetaKeywords(found.metaKeywords || '');
          } else {
            showToast('Projet non trouvé', 'error');
            navigate('/admin/projets');
          }
        })
        .catch(err => showToast(err.message, 'error'))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  // Auto-slugify on title change if not manually edited or new
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isEditing || !slug) {
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Technologies management
  const addTech = (t: string) => {
    const trimmed = t.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
    }
    setTechInput('');
  };

  const removeTech = (t: string) => {
    setTechnologies(technologies.filter(item => item !== t));
  };

  // Features management
  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed) {
      setFeatures([...features, trimmed]);
      setFeatureInput('');
    }
  };

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  // Gallery management
  const addGalleryImage = () => {
    if (galleryInput.trim() && !gallery.includes(galleryInput.trim())) {
      setGallery([...gallery, galleryInput.trim()]);
      setGalleryInput('');
    }
  };

  const removeGalleryImage = (img: string) => {
    setGallery(gallery.filter(i => i !== img));
  };

  // File Upload handler for main image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image trop volumineuse (max 10 Mo)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const uploaded = await api.uploadMedia({
          fileName: file.name,
          fileData,
          mimeType: file.type,
        });
        setMainImage(uploaded.url);
        showToast('Image téléversée avec succès !');
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (targetStatus?: 'published' | 'draft') => {
    if (!title.trim() || !shortDescription.trim()) {
      showToast('Veuillez renseigner au minimum un titre et une description courte.', 'error');
      return;
    }

    setSaving(true);
    const finalStatus = targetStatus || status;

    const projectPayload: Partial<Project> = {
      title: title.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      problem: problem.trim(),
      solution: solution.trim(),
      mainImage: mainImage.trim(),
      gallery,
      category,
      technologies,
      features,
      year,
      client: client.trim(),
      role: role.trim(),
      url: url.trim(),
      github: github.trim(),
      status: finalStatus,
      featured,
      metaTitle: metaTitle.trim() || `${title} — Portfolio Alexandre Mercier`,
      metaDescription: metaDescription.trim() || shortDescription.trim(),
      metaKeywords: metaKeywords.trim(),
    };

    try {
      if (isEditing && projectId) {
        await api.updateProject(projectId, projectPayload);
        showToast(`Projet "${title}" mis à jour avec succès !`);
      } else {
        await api.createProject(projectPayload);
        showToast(`Projet "${title}" créé avec succès !`);
      }
      navigate('/admin/projets');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? `Modifier : ${title || 'Projet'}` : 'Nouveau Projet'}
      subtitle="Remplissez les informations de votre réalisation pour la mettre en valeur"
      actionButton={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/projets"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour liste</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Aperçu</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="p-12 text-center text-slate-400">Chargement du projet...</div>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-8"
        >
          {/* Section 1: Informations Générales */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Informations Générales</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Titre du projet <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="ex: CloudMetrics Platform"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Slug URL <span className="text-slate-500 font-mono">(ex: /projets/mon-projet)</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="cloudmetrics-platform"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Année de réalisation
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="2025"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Votre Rôle
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Architecte & Lead Dev"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Client ou Contexte
              </label>
              <input
                type="text"
                value={client}
                onChange={e => setClient(e.target.value)}
                placeholder="ex: FinTech Enterprise, SaaS B2B, Open Source..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Description courte (aperçu en carte) <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="Courte présentation percutante affichée dans la liste des projets..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Description détaillée
              </label>
              <textarea
                rows={4}
                value={fullDescription}
                onChange={e => setFullDescription(e.target.value)}
                placeholder="Présentation approfondie de l’architecture, des choix techniques et des réalisations..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Problématique rencontrée
                </label>
                <textarea
                  rows={3}
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  placeholder="Quel était le défi ou le problème initial du client/système ?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Solution technique apportée
                </label>
                <textarea
                  rows={3}
                  value={solution}
                  onChange={e => setSolution(e.target.value)}
                  placeholder="Quelle architecture ou approche avez-vous conçue pour résoudre le problème ?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technologies & Fonctionnalités */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Technologies & Fonctionnalités</span>
            </h3>

            {/* Technologies */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Technologies utilisées
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {technologies.map(tech => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/60"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTech(techInput);
                    }
                  }}
                  placeholder="Ajouter une technologie (ex: Docker, Redis)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addTech(techInput)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  Ajouter
                </button>
              </div>

              {/* Suggestions */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Suggestions rapides :</span>
                {COMMON_TECH_SUGGESTIONS.filter(t => !technologies.includes(t))
                  .slice(0, 8)
                  .map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => addTech(sug)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                    >
                      + {sug}
                    </button>
                  ))}
              </div>
            </div>

            {/* Features dynamic list */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Fonctionnalités clés développées
              </label>
              <div className="space-y-2 mb-3">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200"
                  >
                    <span>• {feat}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Ajouter une fonctionnalité (ex: Ingestion haute fréquence 10k req/s)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Médias & Images */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Images & Captures d'écran</span>
            </h3>

            {/* Main Image */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Image principale (Hero)
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-48 h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                  <img
                    src={mainImage}
                    alt="Aperçu principal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <input
                    type="url"
                    value={mainImage}
                    onChange={e => setMainImage(e.target.value)}
                    placeholder="URL de l’image (https://...)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Téléverser depuis mon ordinateur</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">JPG, PNG, WebP (max 10 Mo)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Galerie de captures d'écran additionnelles
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {gallery.map(img => (
                  <div
                    key={img}
                    className="relative w-28 h-20 rounded-lg overflow-hidden border border-slate-800 group"
                  >
                    <img src={img} alt="Galerie" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(img)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={galleryInput}
                  onChange={e => setGalleryInput(e.target.value)}
                  placeholder="URL d'une image pour la galerie..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  Ajouter à la galerie
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Liens & Publication */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Liens & Publication</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  URL du projet en ligne (optionnel)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://mon-application.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  URL GitHub (optionnel)
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                    placeholder="https://github.com/mon-compte/mon-projet"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-6">
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Statut de publication
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Publié</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Brouillon</span>
                    </label>
                  </div>
                </div>

                <div className="border-l border-slate-800 pl-6">
                  <span className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Mise en avant
                  </span>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Afficher en "À la une" sur l'accueil</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
            <Link
              to="/admin/projets"
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Annuler et revenir à la liste
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition"
              >
                Sauvegarder en brouillon
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Publier le projet'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs font-mono font-bold uppercase text-indigo-400">
                Aperçu du projet avant publication
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="h-64 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={mainImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-indigo-400">{category} • {year}</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{title || 'Titre du projet'}</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{shortDescription}</p>
              </div>

              {fullDescription && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">Présentation</h4>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{fullDescription}</p>
                </div>
              )}

              {technologies.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">Stack Technique</h4>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
