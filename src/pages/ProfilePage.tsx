import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import { Avatar } from '@/components/shared/Avatar';
import { supabase } from '@/services/supabaseClient';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Загрузка профиля
  async function loadProfile() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Ошибка загрузки:', error);
        return;
      }

      if (data) {
        setName(data.name || '');
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [user]);

  // Обновление имени (без перезагрузки страницы!)
  async function handleUpdateName() {
    if (!name.trim()) {
      toast.error('Введите имя');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user?.id);

      if (error) throw error;
      
      toast.success('Имя обновлено!');
      
      // 👇 Просто обновляем данные без перезагрузки
      await loadProfile();
      
    } catch (error: any) {
      toast.error(error.message || 'Не удалось обновить имя');
    } finally {
      setLoading(false);
    }
  }

  // Обновление аватарки (без перезагрузки страницы!)
  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user?.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user?.id);
      if (updateError) throw updateError;

      toast.success('Аватар обновлён!');
      setAvatarUrl(urlData.publicUrl);
      
      // 👇 Просто обновляем данные без перезагрузки
      await loadProfile();
      
    } catch (error: any) {
      toast.error(error.message || 'Не удалось загрузить аватар');
    } finally {
      setLoading(false);
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <div className="mx-auto max-w-2xl flex-1 p-6">
        <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Профиль</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Управление данными профиля
          </p>

          <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar
                name={name || user?.email || 'User'}
                avatarUrl={avatarUrl}
                size="lg"
              />
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-500 p-1.5 text-white hover:bg-blue-600">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </label>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <p className="mt-1 text-slate-900 dark:text-white">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Имя
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder="Ваше имя"
                    disabled={loading}
                  />
                  <Button onClick={handleUpdateName} disabled={loading}>
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}