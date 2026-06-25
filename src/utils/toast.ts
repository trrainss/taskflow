import toast from 'react-hot-toast';

export const notifySuccess = (message: string) => {
  toast.success(message);
};

export const notifyError = (error: unknown, fallback?: string) => {
  const message = error instanceof Error ? error.message : fallback || 'Что-то пошло не так';
  toast.error(message);
};