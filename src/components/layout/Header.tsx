import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/providers/ThemeProvider';
import { signOut } from '@/services/authService';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/shared/Button';
import { supabase } from '@/services/supabaseClient';
import { notifyError } from '@/utils/toast';

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);

  async function loadProfile() {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(data);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [user]);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      notifyError(error, 'Не удалось выйти');
    }
  }

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      <Link to="/" className="text-lg font-bold text-brand-600 dark:text-brand-400">
        TaskFlow
      </Link>
    
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Переключить тему"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user && (
          <Link to="/profile" className="flex items-center gap-2">
            <Avatar 
              name={displayName}
              avatarUrl={avatarUrl}
              size="sm" 
            />
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
              {displayName}
            </span>
          </Link>
        )}

        <Button variant="ghost" onClick={handleSignOut}>
          Выйти
        </Button>
      </div>
    </header>
  );
}