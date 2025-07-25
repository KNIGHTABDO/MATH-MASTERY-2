import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Chapter, Lesson, Exercise } from '../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  BookOpen, 
  Calculator,
  Target,
  BarChart3,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import toast from 'react-hot-toast';

interface UserManagement {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  role: string;
  first_name: string | null;
  last_name: string | null;
  profile_first_name: string | null;
  profile_last_name: string | null;
}

const Admin: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'chapters' | 'lessons' | 'exercises' | 'users'>('chapters');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Form states
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    color: 'bg-blue-500',
    icon: 'Calculator'
  });
  
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    chapter_id: ''
  });
  
  const [exerciseForm, setExerciseForm] = useState({
    title: '',
    problem: '',
    solution: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    lesson_id: ''
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
      return;
    }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchChapters(),
      fetchLessons(),
      fetchExercises(),
      fetchUsers()
    ]);
    setLoading(false);
  };

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
    }
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, chapter:chapters(*)')
        .order('order_index');
      
      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*, lesson:lessons(*, chapter:chapters(*))')
        .order('order_index');
      
      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_management')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const promoteToAdmin = async (email: string) => {
    try {
      const { error } = await supabase.rpc('promote_user_to_admin', { user_email: email });
      
      if (error) throw error;
      
      toast.success(`Utilisateur ${email} promu en admin avec succès`);
      await fetchUsers(); // Refresh the users list
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast.error(error.message || 'Erreur lors de la promotion');
    }
  };

  const demoteFromAdmin = async (email: string) => {
    try {
      // First find the user
      const userToUpdate = users.find(u => u.email === email);
      if (!userToUpdate) {
        toast.error('Utilisateur non trouvé');
        return;
      }

      // Update user metadata to student
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        userToUpdate.id,
        { user_metadata: { role: 'student' } }
      );

      if (metadataError) {
        // Fallback: update profile directly
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ role: 'student' })
          .eq('user_id', userToUpdate.id);
          
        if (profileError) throw profileError;
      }

      // Update the profile table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ role: 'student' })
        .eq('user_id', userToUpdate.id);

      if (profileError) throw profileError;

      toast.success(`Utilisateur ${email} rétrogradé en étudiant avec succès`);
      await fetchUsers(); // Refresh the users list
    } catch (error: any) {
      console.error('Error demoting user:', error);
      toast.error(error.message || 'Erreur lors de la rétrogradation');
    }
  };

  // Chapter CRUD operations
  const handleSaveChapter = async () => {
    try {
      const orderIndex = chapters.length;
      
      if (editingChapter) {
        const { error } = await supabase
          .from('chapters')
          .update({
            title: chapterForm.title,
            description: chapterForm.description,
            color: chapterForm.color,
            icon: chapterForm.icon
          })
          .eq('id', editingChapter.id);
        
        if (error) throw error;
        toast.success('Chapitre mis à jour');
      } else {
        const { error } = await supabase
          .from('chapters')
          .insert({
            title: chapterForm.title,
            description: chapterForm.description,
            color: chapterForm.color,
            icon: chapterForm.icon,
            order_index: orderIndex
          });
        
        if (error) throw error;
        toast.success('Chapitre créé');
      }
      
      resetChapterForm();
      fetchChapters();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) return;
    
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Chapitre supprimé');
      fetchChapters();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Lesson CRUD operations
  const handleSaveLesson = async () => {
    try {
      const orderIndex = lessons.filter(l => l.chapter_id === lessonForm.chapter_id).length;
      
      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update({
            title: lessonForm.title,
            content: lessonForm.content,
            chapter_id: lessonForm.chapter_id
          })
          .eq('id', editingLesson.id);
        
        if (error) throw error;
        toast.success('Leçon mise à jour');
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert({
            title: lessonForm.title,
            content: lessonForm.content,
            chapter_id: lessonForm.chapter_id,
            order_index: orderIndex
          });
        
        if (error) throw error;
        toast.success('Leçon créée');
      }
      
      resetLessonForm();
      fetchLessons();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) return;
    
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Leçon supprimée');
      fetchLessons();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Exercise CRUD operations
  const handleSaveExercise = async () => {
    try {
      const orderIndex = exercises.filter(e => e.lesson_id === exerciseForm.lesson_id).length;
      
      if (editingExercise) {
        const { error } = await supabase
          .from('exercises')
          .update({
            title: exerciseForm.title,
            problem: exerciseForm.problem,
            solution: exerciseForm.solution,
            difficulty: exerciseForm.difficulty,
            lesson_id: exerciseForm.lesson_id
          })
          .eq('id', editingExercise.id);
        
        if (error) throw error;
        toast.success('Exercice mis à jour');
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert({
            title: exerciseForm.title,
            problem: exerciseForm.problem,
            solution: exerciseForm.solution,
            difficulty: exerciseForm.difficulty,
            lesson_id: exerciseForm.lesson_id,
            order_index: orderIndex
          });
        
        if (error) throw error;
        toast.success('Exercice créé');
      }
      
      resetExerciseForm();
      fetchExercises();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) return;
    
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Exercice supprimé');
      fetchExercises();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Form reset functions
  const resetChapterForm = () => {
    setChapterForm({ title: '', description: '', color: 'bg-blue-500', icon: 'Calculator' });
    setEditingChapter(null);
    setShowChapterModal(false);
  };

  const resetLessonForm = () => {
    setLessonForm({ title: '', content: '', chapter_id: '' });
    setEditingLesson(null);
    setShowLessonModal(false);
    setPreviewMode(false);
  };

  const resetExerciseForm = () => {
    setExerciseForm({ title: '', problem: '', solution: '', difficulty: 'easy', lesson_id: '' });
    setEditingExercise(null);
    setShowExerciseModal(false);
    setPreviewMode(false);
  };

  // Edit functions
  const editChapter = (chapter: Chapter) => {
    setChapterForm({
      title: chapter.title,
      description: chapter.description,
      color: chapter.color,
      icon: chapter.icon
    });
    setEditingChapter(chapter);
    setShowChapterModal(true);
  };

  const editLesson = (lesson: Lesson) => {
    setLessonForm({
      title: lesson.title,
      content: lesson.content,
      chapter_id: lesson.chapter_id
    });
    setEditingLesson(lesson);
    setShowLessonModal(true);
  };

  const editExercise = (exercise: Exercise) => {
    setExerciseForm({
      title: exercise.title,
      problem: exercise.problem,
      solution: exercise.solution,
      difficulty: exercise.difficulty,
      lesson_id: exercise.lesson_id
    });
    setEditingExercise(exercise);
    setShowExerciseModal(true);
  };

  const renderLatex = (content: string) => {
    try {
      // Simple LaTeX rendering - you might want to enhance this
      if (content.includes('$$')) {
        const parts = content.split('$$');
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <BlockMath key={index} math={part} />;
          }
          return <span key={index}>{part}</span>;
        });
      } else if (content.includes('$')) {
        const parts = content.split('$');
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <InlineMath key={index} math={part} />;
          }
          return <span key={index}>{part}</span>;
        });
      }
      return content;
    } catch (error) {
      return content;
    }
  };

  const iconOptions = [
    { value: 'Calculator', label: 'Calculatrice' },
    { value: 'Target', label: 'Cible' },
    { value: 'BarChart3', label: 'Graphique' },
    { value: 'BookOpen', label: 'Livre' }
  ];

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Bleu' },
    { value: 'bg-emerald-500', label: 'Vert' },
    { value: 'bg-purple-500', label: 'Violet' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-red-500', label: 'Rouge' },
    { value: 'bg-yellow-500', label: 'Jaune' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                Retour
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Administration - Math Mastery</h1>
            </div>
            <div className="text-sm text-gray-500">
              Connecté en tant que: {user?.profile?.first_name} {user?.profile?.last_name}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8">
          {[
            { id: 'chapters', label: 'Chapitres', count: chapters.length },
            { id: 'lessons', label: 'Leçons', count: lessons.length },
            { id: 'exercises', label: 'Exercices', count: exercises.length },
            { id: 'users', label: 'Utilisateurs', count: users.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gestion des Chapitres</h2>
              <button
                onClick={() => setShowChapterModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Nouveau Chapitre
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${chapter.color}`}>
                      {chapter.icon === 'Calculator' && <Calculator className="text-white" size={24} />}
                      {chapter.icon === 'Target' && <Target className="text-white" size={24} />}
                      {chapter.icon === 'BarChart3' && <BarChart3 className="text-white" size={24} />}
                      {chapter.icon === 'BookOpen' && <BookOpen className="text-white" size={24} />}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editChapter(chapter)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{chapter.title}</h3>
                  <p className="text-gray-600 text-sm">{chapter.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gestion des Leçons</h2>
              <button
                onClick={() => setShowLessonModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Nouvelle Leçon
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {lesson.chapter?.title}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{lesson.title}</h3>
                      <div className="text-gray-600 text-sm">
                        {renderLatex(lesson.content.substring(0, 150))}
                        {lesson.content.length > 150 && '...'}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => editLesson(lesson)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gestion des Exercices</h2>
              <button
                onClick={() => setShowExerciseModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Nouvel Exercice
              </button>
            </div>

            <div className="space-y-4">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                          {exercise.lesson?.chapter?.title}
                        </span>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          {exercise.lesson?.title}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exercise.difficulty === 'easy' ? 'Facile' : 
                           exercise.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{exercise.title}</h3>
                      <div className="text-gray-600 text-sm">
                        {renderLatex(exercise.problem.substring(0, 100))}
                        {exercise.problem.length > 100 && '...'}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => editExercise(exercise)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingChapter ? 'Modifier le Chapitre' : 'Nouveau Chapitre'}
              </h3>
              <button onClick={resetChapterForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre du chapitre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Description du chapitre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                <select
                  value={chapterForm.color}
                  onChange={(e) => setChapterForm({ ...chapterForm, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                <select
                  value={chapterForm.icon}
                  onChange={(e) => setChapterForm({ ...chapterForm, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveChapter}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingChapter ? 'Modifier' : 'Créer'}
              </button>
              <button
                onClick={resetChapterForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingLesson ? 'Modifier la Leçon' : 'Nouvelle Leçon'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                  {previewMode ? 'Éditer' : 'Aperçu'}
                </button>
                <button onClick={resetLessonForm} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapitre</label>
                <select
                  value={lessonForm.chapter_id}
                  onChange={(e) => setLessonForm({ ...lessonForm, chapter_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un chapitre</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre de la leçon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu (LaTeX supporté)
                </label>
                {previewMode ? (
                  <div className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="prose max-w-none">
                      {renderLatex(lessonForm.content)}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    rows={15}
                    placeholder="Contenu de la leçon avec LaTeX... Utilisez $...$ pour les formules en ligne et $$...$$ pour les formules en bloc"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveLesson}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingLesson ? 'Modifier' : 'Créer'}
              </button>
              <button
                onClick={resetLessonForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingExercise ? 'Modifier l\'Exercice' : 'Nouvel Exercice'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                  {previewMode ? 'Éditer' : 'Aperçu'}
                </button>
                <button onClick={resetExerciseForm} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leçon</label>
                  <select
                    value={exerciseForm.lesson_id}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, lesson_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une leçon</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.chapter?.title} - {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                  <select
                    value={exerciseForm.difficulty}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={exerciseForm.title}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre de l'exercice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Énoncé (LaTeX supporté)
                </label>
                {previewMode ? (
                  <div className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="prose max-w-none">
                      {renderLatex(exerciseForm.problem)}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={exerciseForm.problem}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, problem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    rows={8}
                    placeholder="Énoncé de l'exercice avec LaTeX..."
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solution (LaTeX supporté)
                </label>
                {previewMode ? (
                  <div className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="prose max-w-none">
                      {renderLatex(exerciseForm.solution)}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={exerciseForm.solution}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, solution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    rows={8}
                    placeholder="Solution de l'exercice avec LaTeX..."
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveExercise}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingExercise ? 'Modifier' : 'Créer'}
              </button>
              <button
                onClick={resetExerciseForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
            <div className="text-sm text-gray-600">
              Total: {users.length} utilisateurs
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.profile_first_name || userItem.first_name || 'N/A'} {userItem.profile_last_name || userItem.last_name || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {userItem.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{userItem.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {userItem.role === 'admin' ? 'Admin' : 'Étudiant'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.email_confirmed_at 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userItem.email_confirmed_at ? 'Confirmé' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.last_sign_in_at 
                          ? new Date(userItem.last_sign_in_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Jamais connecté'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {userItem.role !== 'admin' && userItem.id !== user?.id && (
                          <button
                            onClick={() => promoteToAdmin(userItem.email)}
                            className="text-purple-600 hover:text-purple-900 mr-4"
                            title="Promouvoir en admin"
                          >
                            Promouvoir
                          </button>
                        )}
                        {userItem.role === 'admin' && userItem.id !== user?.id && (
                          <button
                            onClick={() => demoteFromAdmin(userItem.email)}
                            className="text-orange-600 hover:text-orange-900 mr-4"
                            title="Rétrograder en étudiant"
                          >
                            Rétrograder
                          </button>
                        )}
                        {userItem.id === user?.id && (
                          <span className="text-gray-400">Vous</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Aucun utilisateur trouvé</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;