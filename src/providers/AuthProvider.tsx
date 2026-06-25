import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/services/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для загрузки или создания профиля
  async function loadOrCreateProfile(userId: string, email: string) {
    // Пробуем получить профиль
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Если профиль найден - возвращаем
    if (data) return data;

    // Если профиля нет - создаём
    if (error && error.code === 'PGRST116') {
      const name = email?.split('@')[0] || 'User';
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, name })
        .select()
        .single();

      if (insertError) {
        console.error('Ошибка создания профиля:', insertError);
        return null;
      }
      return newProfile;
    }

    // Другая ошибка
    console.error('Ошибка загрузки профиля:', error);
    return null;
  }

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const profileData = await loadOrCreateProfile(currentUser.id, currentUser.email || '');
        setProfile(profileData);
      }
      
      setIsLoading(false);
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const profileData = await loadOrCreateProfile(currentUser.id, currentUser.email || '');
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { AuthContext };