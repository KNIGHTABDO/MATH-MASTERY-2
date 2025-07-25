export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // LaTeX content
  chapter_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  chapter?: Chapter;
  exercises?: Exercise[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Exercise {
  id: string;
  lesson_id: string;
  title: string;
  problem: string; // LaTeX content
  solution: string; // LaTeX content
  difficulty: 'easy' | 'medium' | 'hard';
  order_index: number;
  created_at: string;
  updated_at: string;
  lesson?: Lesson;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}