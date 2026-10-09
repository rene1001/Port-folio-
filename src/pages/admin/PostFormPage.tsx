import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.tsx';
import { useRouter, Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Post } from '../../types.ts';
import {
  Save,
  ArrowLeft,
  Upload,
  Eye,
  CheckCircle,
  FileText,
  Sparkles,
  X,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  Minus,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
} from 'lucide-react';

interface PostFormPageProps {
  postId?: string;
}

const CATEGORIES = [
  'Architecture Logicielle',
  'Bases de Données',
  'Ingénierie Logicielle',
  'DevOps & Cloud',
  'Frontend & React',
  'Sécurité Informatique',
  'Systèmes Distribués',
];

export const PostFormPage: React.FC<PostFormPageProps> = ({ postId }) => {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const isEditing = Boolean(postId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [mainImage, setMainImage] = useState(
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
  );
  const [ogImage, setOgImage] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>(['Clean Code', 'TypeScript']);
  const [tagInput, setTagInput] = useState('');
  const [author, setAuthor] = useState('Alexandre Mercier');
  const [readingTime, setReadingTime] = useState('5 min');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    if (postId) {
      setLoading(true);
      api.getAdminPosts()
        .then(posts => {
          const found = posts.find(p => p.id === postId);
          if (found) {
            setTitle(found.title);
            setSlug(found.slug);
            setExcerpt(found.excerpt);
            setContent(found.content);
            setMainImage(found.mainImage || '');
            setOgImage(found.ogImage || '');
            setCategory(found.category || CATEGORIES[0]);
            setTags(found.tags || []);
            setAuthor(found.author || 'Alexandre Mercier');
            setReadingTime(found.readingTime || '5 min');
            setStatus(found.status || 'published');
            setMetaTitle(found.metaTitle || '');
            setMetaDescription(found.metaDescription || '');
          } else {
            showToast('Article non trouvé', 'error');
            navigate('/admin/blog');
          }
        })
        .catch(err => showToast(err.message, 'error'))
        .finally(() => setLoading(false));
    }
  }, [postId]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isEditing || !slug) {
      const generated = newTitle
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generated);
    }
  };

  // Auto calculate reading time based on word count
  useEffect(() => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    setReadingTime(`${minutes} min`);
  }, [content]);

  // Insert markdown helpers
  const insertSnippet = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || 'texte') + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  const addTag = (t: string) => {
    const trimmed = t.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => {
    setTags(tags.filter(item => item !== t));
  };

  // Upload handler for main image
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
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      showToast('Veuillez renseigner au minimum un titre, un extrait et le contenu.', 'error');
      return;
    }

    setSaving(true);
    const finalStatus = targetStatus || status;

    const payload: Partial<Post> = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      mainImage: mainImage.trim(),
      ogImage: ogImage.trim() || mainImage.trim(),
      category,
      tags,
      author: author.trim(),
      readingTime,
      status: finalStatus,
      metaTitle: metaTitle.trim() || `${title} — Blog Alexandre Mercier`,
      metaDescription: metaDescription.trim() || excerpt.trim(),
    };

    try {
      if (isEditing && postId) {
        await api.updatePost(postId, payload);
        showToast(`Article "${title}" mis à jour avec succès !`);
      } else {
        await api.createPost(payload);
        showToast(`Article "${title}" créé avec succès !`);
      }
      navigate('/admin/blog');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? `Modifier : ${title || 'Article'}` : 'Nouvel Article de Blog'}
      subtitle="Rédigez et publiez vos articles techniques avec l'éditeur enrichi"
      actionButton={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/blog"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour liste</span>
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{activeTab === 'editor' ? 'Prévisualiser' : 'Mode Éditeur'}</span>
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
        <div className="p-12 text-center text-slate-400">Chargement de l'article...</div>
      ) : (
        <div className="space-y-8">
          {/* Metadata Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Titre de l'article <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="ex: Concevoir des architectures résilientes en microservices"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Slug URL <span className="text-slate-500 font-mono">(ex: /blog/mon-article)</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="concevoir-architectures-resilientes"
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
                  Auteur
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Alexandre Mercier"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                  Temps de lecture estimé
                </label>
                <input
                  type="text"
                  value={readingTime}
                  onChange={e => setReadingTime(e.target.value)}
                  placeholder="5 min"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Extrait / Résumé d'introduction <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Court résumé percutant qui donne envie de lire l'article complet..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Tags / Mots-clés
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/60"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
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
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Ajouter un tag (ex: Microservices, MySQL)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  Ajouter tag
                </button>
              </div>
            </div>

            {/* Main Image */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Image de couverture (Hero & Open Graph)
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-48 h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                  <img
                    src={mainImage}
                    alt="Aperçu couverture"
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rich Editor Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Editor Toolbar */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertSnippet('## ')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold"
                  title="Titre H2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('### ')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold"
                  title="Titre H3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-slate-800 mx-1" />
                <button
                  type="button"
                  onClick={() => insertSnippet('**', '**')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                  title="Gras"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('*', '*')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs italic"
                  title="Italique"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-slate-800 mx-1" />
                <button
                  type="button"
                  onClick={() => insertSnippet('> ')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Citation"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('```typescript\n', '\n```')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Bloc de Code"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('- ')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Liste à puces"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('1. ')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Liste numérotée"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('\n---\n')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Séparateur horizontal"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('[Titre du lien](', ')') }
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Insérer lien"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('![Description de l\'image](', ')') }
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Insérer image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('\n| Colonne 1 | Colonne 2 |\n|-----------|-----------|\n| Valeur 1  | Valeur 2  |\n')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Insérer tableau"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>

              {/* View Switch */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    activeTab === 'editor'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Éditeur
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    activeTab === 'preview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Aperçu en direct
                </button>
              </div>
            </div>

            {/* Content Textarea OR Live Preview */}
            {activeTab === 'editor' ? (
              <div className="p-4 bg-slate-950">
                <textarea
                  id="post-content-textarea"
                  rows={20}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Rédigez le contenu de votre article ici (titres, paragraphes, citations, code...)..."
                  className="w-full bg-slate-950 font-mono text-sm text-slate-200 border-0 focus:outline-none focus:ring-0 leading-relaxed resize-y"
                />
              </div>
            ) : (
              <div className="p-8 bg-slate-950/60 min-h-[400px] prose prose-invert max-w-none">
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <span className="text-xs font-semibold text-cyan-400">{category} • {readingTime}</span>
                  <h1 className="text-3xl font-extrabold text-white mt-2">{title || 'Titre de l’article'}</h1>
                  <p className="text-slate-300 text-base mt-2 italic">{excerpt}</p>
                </div>
                <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed space-y-4">
                  {content ? (
                    content.split('\n\n').map((block, idx) => {
                      if (block.startsWith('## ')) {
                        return <h2 key={idx} className="text-xl font-bold text-white pt-4">{block.replace('## ', '')}</h2>;
                      }
                      if (block.startsWith('### ')) {
                        return <h3 key={idx} className="text-lg font-bold text-slate-200 pt-2">{block.replace('### ', '')}</h3>;
                      }
                      if (block.startsWith('```')) {
                        const cleanCode = block.replace(/```[a-z]*/g, '').trim();
                        return (
                          <pre key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                            <code>{cleanCode}</code>
                          </pre>
                        );
                      }
                      if (block.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 italic text-slate-300 my-2">
                            {block.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return <p key={idx} className="leading-relaxed">{block}</p>;
                    })
                  ) : (
                    <p className="text-slate-500 italic">Aucun contenu saisi pour le moment.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Publication and Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Statut de publication de l'article
              </span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="post-status"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publié en ligne</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="post-status"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Brouillon privé</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition"
              >
                Enregistrer en brouillon
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {saving ? 'Publication...' : 'Publier l’article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
