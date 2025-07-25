import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Target, 
  Award, 
  TrendingUp, 
  Clock, 
  Star,
  ChevronRight,
  Play,
  FileText,
  PenTool,
  Brain,
  Users,
  Menu,
  X,
  Zap,
  Trophy,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Sparkles,
  GraduationCap,
  BookMarked,
  Timer,
  Medal
} from 'lucide-react';

function App() {
  const [activeSection, setActiveSection] = useState('accueil');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const chapitres = [
    {
      id: 'analyse',
      titre: 'Analyse Mathématique',
      description: 'Maîtrisez les concepts fondamentaux de l\'analyse',
      sousTitres: ['Limites et Continuité', 'Dérivabilité', 'Étude de Fonctions', 'Primitives et Intégrales'],
      couleur: 'from-blue-500 to-blue-700',
      couleurAccent: 'bg-blue-500',
      icone: TrendingUp,
      progression: 85,
      exercices: 120,
      temps: '45h'
    },
    {
      id: 'algebre',
      titre: 'Algèbre Avancée',
      description: 'Explorez les structures algébriques complexes',
      sousTitres: ['Nombres Complexes', 'Arithmétique', 'Structures Algébriques', 'Polynômes'],
      couleur: 'from-emerald-500 to-emerald-700',
      couleurAccent: 'bg-emerald-500',
      icone: Calculator,
      progression: 72,
      exercices: 95,
      temps: '38h'
    },
    {
      id: 'geometrie',
      titre: 'Géométrie dans l\'Espace',
      description: 'Visualisez et résolvez en trois dimensions',
      sousTitres: ['Géométrie Euclidienne', 'Géométrie Analytique', 'Transformations', 'Sections Planes'],
      couleur: 'from-purple-500 to-purple-700',
      couleurAccent: 'bg-purple-500',
      icone: Target,
      progression: 58,
      exercices: 87,
      temps: '42h'
    },
    {
      id: 'probabilites',
      titre: 'Probabilités & Statistiques',
      description: 'Analysez l\'incertain avec précision',
      sousTitres: ['Probabilités Conditionnelles', 'Variables Aléatoires', 'Lois de Probabilité', 'Statistiques'],
      couleur: 'from-orange-500 to-red-500',
      couleurAccent: 'bg-orange-500',
      icone: BarChart3,
      progression: 43,
      exercices: 76,
      temps: '35h'
    }
  ];

  const navigationItems = [
    { id: 'accueil', titre: 'Accueil', icone: BookOpen },
    { id: 'chapitres', titre: 'Chapitres', icone: BookMarked },
    { id: 'exercices', titre: 'Exercices', icone: PenTool },
    { id: 'examens', titre: 'Examens Blancs', icone: GraduationCap },
    { id: 'progression', titre: 'Progression', icone: Trophy }
  ];

  const AccueilSection = () => (
    <div className="space-y-16">
      {/* Hero Section Ultra Premium */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 rounded-3xl transform rotate-1"></div>
        <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl p-12 lg:p-16 text-white overflow-hidden shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-32 right-20 w-24 h-24 bg-yellow-400/20 rounded-full blur-lg animate-bounce"></div>
            <div className="absolute bottom-20 left-32 w-40 h-40 bg-purple-400/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-10 right-10 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl animate-bounce delay-500"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Sparkles className="text-yellow-300" size={24} />
              </div>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                Plateforme N°1 au Maroc
              </span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Excellez en
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Mathématiques
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
              La plateforme la plus complète pour réussir votre <strong>2 BAC Sciences Mathématiques</strong>. 
              Cours détaillés, exercices progressifs et examens blancs authentiques.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => setActiveSection('chapitres')}
                className="group bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
              >
                <Play size={24} className="group-hover:scale-110 transition-transform" />
                Commencer Maintenant
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-white/40 backdrop-blur-sm px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3">
                <Trophy size={20} />
                Voir les Résultats
              </button>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Étudiants', value: '3.2K+', icon: Users },
                { label: 'Exercices', value: '500+', icon: PenTool },
                { label: 'Réussite', value: '94%', icon: Trophy },
                { label: 'Satisfaction', value: '4.9/5', icon: Star }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                  <stat.icon size={24} className="mx-auto mb-2 text-yellow-300" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            titre: 'Chapitres Complets', 
            valeur: '24', 
            description: 'Programme officiel 2 BAC', 
            icone: BookOpen, 
            couleur: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          { 
            titre: 'Exercices Variés', 
            valeur: '500+', 
            description: 'Tous niveaux de difficulté', 
            icone: PenTool, 
            couleur: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
          },
          { 
            titre: 'Examens Blancs', 
            valeur: '15', 
            description: 'Conditions réelles', 
            icone: GraduationCap, 
            couleur: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
          },
          { 
            titre: 'Taux de Réussite', 
            valeur: '94%', 
            description: 'Étudiants satisfaits', 
            icone: Trophy, 
            couleur: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
          }
        ].map((stat, index) => (
          <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-6">
              <div className={`${stat.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                <stat.icone className={stat.textColor} size={32} />
              </div>
              <div className={`text-4xl font-black bg-gradient-to-r ${stat.couleur} bg-clip-text text-transparent`}>
                {stat.valeur}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{stat.titre}</h3>
            <p className="text-gray-600">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Chapitres en Vedette - Design Ultra Premium */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-gray-800 mb-4">
            Chapitres <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Populaires</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les chapitres les plus appréciés par nos étudiants
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {chapitres.slice(0, 2).map((chapitre, index) => (
            <div key={chapitre.id} className="group relative">
              {/* Effet de profondeur */}
              <div className={`absolute inset-0 bg-gradient-to-br ${chapitre.couleur} rounded-3xl transform rotate-2 opacity-20 group-hover:rotate-3 transition-transform duration-500`}></div>
              
              <div className="relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden border border-gray-100 transform group-hover:-translate-y-2">
                {/* Header avec gradient */}
                <div className={`bg-gradient-to-br ${chapitre.couleur} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <chapitre.icone size={40} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black">{chapitre.progression}%</div>
                        <div className="text-white/80 text-sm">Complété</div>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black mb-3">{chapitre.titre}</h3>
                    <p className="text-white/90 text-lg">{chapitre.description}</p>
                  </div>
                </div>
                
                {/* Contenu */}
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-2xl">
                      <div className="text-2xl font-bold text-gray-800">{chapitre.exercices}</div>
                      <div className="text-sm text-gray-600">Exercices</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-2xl">
                      <div className="text-2xl font-bold text-gray-800">{chapitre.temps}</div>
                      <div className="text-sm text-gray-600">de contenu</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {chapitre.sousTitres.map((sousTitre, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer group/item">
                        <div className={`w-3 h-3 ${chapitre.couleurAccent} rounded-full group-hover/item:scale-125 transition-transform`}></div>
                        <span className="font-medium">{sousTitre}</span>
                        <ChevronRight size={16} className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Barre de progression premium */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">Progression</span>
                      <span className="text-sm font-bold text-blue-600">{chapitre.progression}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${chapitre.couleur} h-3 rounded-full transition-all duration-1000 relative overflow-hidden`}
                        style={{ width: `${chapitre.progression}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button className={`flex-1 bg-gradient-to-r ${chapitre.couleur} text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105`}>
                      <Play size={20} />
                      Continuer le Cours
                    </button>
                    <button className="px-6 py-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:border-gray-300">
                      <FileText size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ChapitresSection = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-5xl font-black text-gray-800 mb-4">
          Tous les <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chapitres</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Programme complet 2 BAC Sciences Mathématiques conforme au système éducatif marocain
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chapitres.map((chapitre, index) => (
          <div key={chapitre.id} className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${chapitre.couleur} rounded-3xl transform rotate-1 opacity-10 group-hover:rotate-2 transition-transform duration-500`}></div>
            
            <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform group-hover:-translate-y-1">
              <div className={`bg-gradient-to-br ${chapitre.couleur} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{chapitre.titre}</h3>
                    <p className="text-white/90">{chapitre.description}</p>
                  </div>
                  <chapitre.icone size={48} className="opacity-90 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl font-bold text-gray-800">{chapitre.exercices}</div>
                    <div className="text-xs text-gray-600">Exercices</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-xl font-bold text-gray-800">{chapitre.temps}</div>
                    <div className="text-xs text-gray-600">Contenu</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  {chapitre.sousTitres.map((sousTitre, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer p-2 rounded-lg hover:bg-blue-50">
                      <div className={`w-2 h-2 ${chapitre.couleurAccent} rounded-full`}></div>
                      <span className="text-sm font-medium">{sousTitre}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-600">Progression</span>
                    <span className="text-xs font-bold text-blue-600">{chapitre.progression}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${chapitre.couleur} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${chapitre.progression}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className={`flex-1 bg-gradient-to-r ${chapitre.couleur} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2`}>
                    <Play size={16} />
                    Continuer
                  </button>
                  <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    <FileText size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ExercicesSection = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-5xl font-black text-gray-800 mb-4">
          Banque d'<span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Exercices</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Plus de 500 exercices soigneusement sélectionnés et classés par niveau de difficulté
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            niveau: 'Débutant', 
            nombre: 180, 
            description: 'Bases solides', 
            couleur: 'from-green-500 to-emerald-600',
            icone: Star,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
          },
          { 
            niveau: 'Intermédiaire', 
            nombre: 220, 
            description: 'Progression rapide', 
            couleur: 'from-orange-500 to-red-500',
            icone: Target,
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
          },
          { 
            niveau: 'Avancé', 
            nombre: 100, 
            description: 'Excellence garantie', 
            couleur: 'from-purple-500 to-indigo-600',
            icone: Brain,
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
          }
        ].map((niveau, index) => (
          <div key={index} className={`group relative overflow-hidden rounded-3xl ${niveau.bgColor} border-2 ${niveau.borderColor} hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${niveau.couleur} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`bg-gradient-to-br ${niveau.couleur} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300`}>
                  <niveau.icone size={32} />
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-black bg-gradient-to-r ${niveau.couleur} bg-clip-text text-transparent`}>
                    {niveau.nombre}
                  </div>
                  <div className="text-sm text-gray-600">exercices</div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{niveau.niveau}</h3>
              <p className="text-gray-600 mb-6">{niveau.description}</p>
              
              <button className={`w-full bg-gradient-to-r ${niveau.couleur} text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                Commencer
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Exercices Recommandés</h3>
        <div className="space-y-4">
          {[
            { 
              titre: "Limites de fonctions - Formes indéterminées", 
              chapitre: "Analyse", 
              temps: "25 min", 
              points: "8 pts",
              difficulte: "Moyen",
              couleur: "bg-blue-500"
            },
            { 
              titre: "Nombres Complexes - Forme exponentielle", 
              chapitre: "Algèbre", 
              temps: "30 min", 
              points: "10 pts",
              difficulte: "Avancé",
              couleur: "bg-purple-500"
            },
            { 
              titre: "Géométrie dans l'Espace - Sections planes", 
              chapitre: "Géométrie", 
              temps: "35 min", 
              points: "12 pts",
              difficulte: "Avancé",
              couleur: "bg-purple-500"
            }
          ].map((exercice, index) => (
            <div key={index} className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:from-blue-50 hover:to-blue-100 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${exercice.couleur} rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">{exercice.titre}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">{exercice.chapitre}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exercice.difficulte === 'Avancé' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {exercice.difficulte}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Timer size={16} />
                  {exercice.temps}
                </div>
                <div className="text-lg font-bold text-blue-600">{exercice.points}</div>
                <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'accueil':
        return <AccueilSection />;
      case 'chapitres':
        return <ChapitresSection />;
      case 'exercices':
        return <ExercicesSection />;
      default:
        return <AccueilSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header Ultra Premium */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrollY > 50 
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50' 
          : 'bg-white/80 backdrop-blur-sm shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl">
                  <Calculator className="text-white" size={28} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MATH MASTERY
                </h1>
                <p className="text-sm text-gray-500 font-semibold">2 BAC Sciences • Maroc</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <item.icone size={20} />
                  {item.titre}
                </button>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-3 rounded-2xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50">
            <div className="px-4 py-6 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <item.icone size={20} />
                  {item.titre}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderSection()}
      </main>

      {/* Footer Premium */}
      <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Calculator className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-black">MATH MASTERY</h3>
            </div>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Votre partenaire de confiance pour exceller en mathématiques au 2 BAC
            </p>
            <div className="flex justify-center gap-8 text-sm text-blue-300">
              <span>© 2024 Math Mastery</span>
              <span>•</span>
              <span>Fait avec ❤️ pour les étudiants marocains</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;