import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '@/services/authService';
import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { notifyError, notifySuccess } from '@/utils/toast';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      notifySuccess('Вы вошли в систему');
      navigate('/');
    } catch (error) {
      notifyError(error, 'Не удалось войти');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        id="email"
        type="email"
        label="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <TextField
        id="password"
        type="password"
        label="Пароль"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Войти
      </Button>
    </form>
  );
}
