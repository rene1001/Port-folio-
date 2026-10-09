import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/public/Navbar.tsx';
import { Footer } from '../../components/public/Footer.tsx';
import { Link } from '../../router/Router.tsx';
import { api } from '../../services/api.ts';
import type { Project, Profile } from '../../types.ts';
import { Search, Filter, ExternalLink, Github, ArrowRight, Star, FolderGit2 } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTech, setSelectedTech] = useState('Toutes');
  const [selectedYear, setSelectedYear] = useState('Toutes');

  useEffect(() => {
    Promise.all([api.getProjects(), api.getProfile()])
      .then(([projRes, profRes]) => {
        setProjects(projRes);
        setProfile(profRes);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Tous', ...Array.from(new Set(projects.map(p => p.category)))];
  const allTechs = Array.from(new Set(projects.flatMap(p => p.technologies))).sort();
  const years = ['Toutes', ...Array.from(new Set(projects.map(p => p.year))).sort().reverse()];

  const filtered = projects.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      p.technologies.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchTech = selectedTech === 'Toutes' || p.technologies.includes(selectedTech);
    const matchYear = selectedYear === 'Toutes' || p.year === selectedYear;

    return matchSearch && matchCategory && matchTech && matchYear;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar availableForWork={profile?.availableForWork} profile={profile} />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Réalisations
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Tous les Projets
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">
              Explorez mes réalisations en ingénierie logicielle, plateformes SaaS, moteurs e-commerce et outils DevOps.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par titre, technologie..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      Catégorie : {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {years.map(yr => (
                    <option key={yr} value={yr}>
                      Année : {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Tech filters */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 mr-2">Technologie :</span>
              <button
                onClick={() => setSelectedTech('Toutes')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedTech === 'Toutes'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Toutes
              </button>
              {allTechs.slice(0, 8).map(tech => (
                <button
                  key={tech}
                  onClick={() => setSelectedTech(tech)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedTech === tech
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="p-16 text-center text-slate-400">Chargement des projets...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
              <FolderGit2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Aucun projet ne correspond à vos filtres</h3>
              <p className="text-xs text-slate-400 mt-1">Essayez d'élargir votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(proj => (
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
                          <span className="text-[11px] text-slate-400">
                            +{proj.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                    <Link
                      to={`/projets/${proj.slug}`}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 group/btn"
                    >
                      <span>Voir le projet</span>
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
                          title="Voir le code source"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer profile={profile || undefined} />
    </div>
  );
};
