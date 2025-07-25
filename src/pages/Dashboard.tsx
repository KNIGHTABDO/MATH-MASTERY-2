import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Chapter, Lesson } from '../types';
import { 
  BookOpen, 
  Calculator, 
  Target, 
  BarChart3,
  ChevronRight,
  Clock,
  Trophy,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapters();
  }, []);

  useEffect(() => {
    if (selectedChapter) {
      fetchLessons(selectedChapter.id);
    }
  }, [selectedChapter]);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Erreur lors du chargement des chapitres');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (chapterId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Erreur lors du chargement des leçons');
    }
  };

  const getChapterIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'Calculator': Calculator,
      'Target': Target,
      'BarChart3': BarChart3,
      'BookOpen': BookOpen
    };
    return icons[iconName] || BookOpen;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Calculator className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black text-gray-900">MATH MASTERY</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={20} />
                <span className="font-medium">
                  {user?.profile?.first_name} {user?.profile?.last_name}
                </span>
              </div>
              
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  <Settings size={16} className="inline mr-2" />
                  Admin
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors duration-200"
              >
                <LogOut size={16} className="inline mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chapters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Chapitres</h2>
              
              {chapters.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun chapitre disponible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chapter) => {
                    const IconComponent = getChapterIcon(chapter.icon);
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => setSelectedChapter(chapter)}
                        className={`w-full p-4 rounded-2xl text-left transition-all duration-200 ${
                          selectedChapter?.id === chapter.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            selectedChapter?.id === chapter.id
                              ? 'bg-white/20'
                              : chapter.color
                          }`}>
                            <IconComponent size={20} className={
                              selectedChapter?.id === chapter.id ? 'text-white' : 'text-white'
                            } />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold">{chapter.title}</h3>
                            <p className={`text-sm ${
                              selectedChapter?.id === chapter.id ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {chapter.description}
                            </p>
                          </div>
                          <ChevronRight size={20} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Lessons Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              {selectedChapter ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedChapter.title}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {selectedChapter.description}
                    </p>
                  </div>

                  {lessons.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Leçons à venir
                      </h3>
                      <p className="text-gray-500">
                        Les leçons pour ce chapitre seront bientôt disponibles.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {lesson.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={16} />
                                  Durée estimée: 30 min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Trophy size={16} />
                                  Points: 10
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={24} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sélectionnez un chapitre
                  </h3>
                  <p className="text-gray-500">
                    Choisissez un chapitre dans la liste pour voir les leçons disponibles.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;