export const getInitials = (name: string): string => {
  if (!name) return '?';
  return name
    .trim()
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// ДОБАВЛЯЕМ ФУНКЦИЮ isOverdue
export const isOverdue = (dueDate: string | null | undefined): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

// ДОБАВЛЯЕМ ФУНКЦИЮ formatDate (если нужна)
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};