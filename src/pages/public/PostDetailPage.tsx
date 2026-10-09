import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/public/Navbar.tsx';
import { Footer } from '../../components/public/Footer.tsx';
import { useRouter, Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import type { Post, Profile } from '../../types.ts';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Linkedin,
  Twitter,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface PostDetailPageProps {
  slug: string;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getPostBySlug(slug), api.getProfile()])
      .then(([res, prof]) => {
        setPost(res.post);
        setRelated(res.related);
        setProfile(prof);
      })
      .catch(() => {
        navigate('/blog');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const copyArticleLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Lien de l’article copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Découvrez l'article "${post?.title}" par ${post?.author}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Chargement de l'article...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar availableForWork={profile?.availableForWork} profile={profile} />

      <main className="flex-1 py-12 lg:py-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Back button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux articles</span>
          </Link>

          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                {post.category}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {post.readingTime}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-4 py-1">
              {post.excerpt}
            </p>

            {/* Author bar & Share buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={post.author} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-indigo-400" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{post.author}</span>
                  <span className="text-xs text-slate-400 font-mono">Ingénieur Logiciel</span>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Partager :</span>
                </span>
                <button
                  onClick={shareOnLinkedIn}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-indigo-400 transition"
                  title="Partager sur LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 transition"
                  title="Partager sur Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={copyArticleLink}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
                  title="Copier le lien de l'article"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Hero Cover Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src={post.mainImage}
              alt={post.title}
              className="w-full h-[320px] sm:h-[440px] object-cover"
            />
          </div>

          {/* Article Rich Content */}
          <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-base space-y-6 pt-4">
            {post.content.split('\n\n').map((block, idx) => {
              if (block.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-2xl font-bold text-white pt-6 border-t border-slate-800/80">
                    {block.replace('## ', '')}
                  </h2>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xl font-bold text-slate-100 pt-4">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('```')) {
                const codeOnly = block.replace(/```[a-z]*/g, '').trim();
                return (
                  <pre
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto shadow-inner"
                  >
                    <code>{codeOnly}</code>
                  </pre>
                );
              }
              if (block.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    className="border-l-4 border-cyan-500 pl-4 py-2 italic text-slate-300 bg-slate-900/40 rounded-r-xl"
                  >
                    {block.replace('> ', '')}
                  </blockquote>
                );
              }
              if (block.startsWith('- ')) {
                const items = block.split('\n').map(l => l.replace('- ', '').trim());
                return (
                  <ul key={idx} className="space-y-2 pl-4 list-disc text-slate-300">
                    {items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="leading-relaxed text-slate-300">
                  {block}
                </p>
              );
            })}
          </div>

          {/* Tags bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 self-center mr-2">Tags :</span>
            {post.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Author Bio Card with Photo */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-md shrink-0 overflow-hidden">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile?.name || post.author}
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
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Rédigé par</span>
              <h4 className="text-base font-bold text-white">{profile?.name || post.author}</h4>
              <p className="text-xs text-slate-300">
                {profile?.title || 'Ingénieur en Informatique & Architecte Logiciel'}
              </p>
              <p className="text-xs text-slate-400 pt-1 line-clamp-2">
                {profile?.tagline || 'Spécialisé en conception de systèmes fiables, architectures distribuées et applications web modernes.'}
              </p>
            </div>
            <Link
              to="/a-propos"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition shrink-0 self-start sm:self-center"
            >
              En savoir plus
            </Link>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="pt-12 border-t border-slate-800 space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Articles Similaires</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map(rel => (
                  <div
                    key={rel.id}
                    className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-mono text-cyan-400">{rel.category}</span>
                      <h4 className="text-sm font-bold text-white mt-1 line-clamp-2">
                        <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{rel.excerpt}</p>
                    </div>
                    <Link
                      to={`/blog/${rel.slug}`}
                      className="text-xs font-semibold text-cyan-400 mt-4 inline-flex items-center gap-1"
                    >
                      <span>Lire</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer profile={profile || undefined} />
    </div>
  );
};
