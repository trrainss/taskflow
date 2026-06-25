import { getInitials } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-16 w-16 text-xl',
};

export function Avatar({ name, avatarUrl, size = 'sm' }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn('rounded-full object-cover', sizeClasses[size])}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-blue-500 font-medium text-white',
        sizeClasses[size],
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}