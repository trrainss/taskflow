import type { Priority } from '@/types';

export const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done'] as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
};

export const AVATAR_BUCKET = 'avatars';
