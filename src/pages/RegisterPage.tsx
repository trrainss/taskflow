import { Link } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm dark:bg-slate-800">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand-600 dark:text-brand-400">
          TaskFlow
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Создайте новый аккаунт
        </p>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
