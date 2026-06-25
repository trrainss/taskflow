import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import toast from 'react-hot-toast';

export function RegisterForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      // Если есть ошибка - показываем
      if (error) {
        // Если пользователь уже существует - это не ошибка!
        if (error.message?.includes('User already registered')) {
          toast.success('Аккаунт уже существует! Войдите.');
          navigate('/login');
          return;
        }
        throw error;
      }

      // Если пользователь создан
      if (data?.user) {
        toast.success('Регистрация успешна! Войдите в аккаунт.');
        navigate('/login');
      } else {
        // Если требуется подтверждение email
        toast.success('Проверьте почту для подтверждения!');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      toast.error(error.message || 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <TextField
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@mail.com"
        required
        disabled={loading}
      />
      <TextField
        type="password"
        label="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Минимум 6 символов"
        required
        disabled={loading}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}