import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/public/Navbar.tsx';
import { Footer } from '../../components/public/Footer.tsx';
import { Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import type { Post, Profile } from '../../types.ts';
import { Search, Calendar, Clock, ArrowRight, FileText, Tag } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getPosts(), api.getProfile()])
      .then(([postRes, profRes]) => {
        setPosts(postRes);
        setProfile(profRes);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Tous', ...Array.from(new Set(posts.map(p => p.category)))];
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort();

  const filtered = posts.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchTag = !selectedTag || p.tags.includes(selectedTag);

    return matchSearch && matchCategory && matchTag;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar availableForWork={profile?.availableForWork} profile={profile} />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Blog & Publications
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Articles & Retours d'Expérience
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">
              Architecture logicielle, optimisation de bases de données MySQL, Clean Code et retours d'expérience sur la conception de systèmes résilients.
            </p>
          </div>

          {/* Search & Categories */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un article, sujet, mot-clé..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Categories pills */}
              <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedTag(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      selectedCategory === cat && !selectedTag
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular tags */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Tags :</span>
                </span>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded-md font-mono transition ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="p-16 text-center text-slate-400">Chargement des articles...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
              <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Aucun article trouvé</h3>
              <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(post => (
                <article
                  key={post.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition"
                >
                  <div>
                    <div className="relative h-48 bg-slate-950 overflow-hidden">
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
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {post.readingTime}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-2">
                        {post.tags.map(t => (
                          <span
                            key={t}
                            className="text-[10px] text-slate-500 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
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
          )}
        </div>
      </main>

      <Footer profile={profile || undefined} />
    </div>
  );
};
