import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm dark:bg-slate-800">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand-600 dark:text-brand-400">
          TaskFlow
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Войдите в свой аккаунт
        </p>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
