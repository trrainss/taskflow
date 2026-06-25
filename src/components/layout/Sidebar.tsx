import { NavLink } from 'react-router-dom';
import type { BoardWithRole } from '@/types';
import { cn } from '@/utils/helpers';

interface SidebarProps {
  boards: BoardWithRole[];
}

export function Sidebar({ boards }: SidebarProps) {
  if (boards.length === 0) return null;

  return (
    <aside className="hidden w-56 flex-col gap-1 border-r border-slate-200 p-3 dark:border-slate-700 md:flex">
      <p className="mb-2 px-2 text-xs font-semibold uppercase text-slate-400">Мои доски</p>
      {boards.map((board) => (
        <NavLink
          key={board.id}
          to={`/boards/${board.id}`}
          className={({ isActive }) =>
            cn(
              'truncate rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
              isActive && 'bg-brand-50 font-medium text-brand-700 dark:bg-slate-700 dark:text-brand-300',
            )
          }
        >
          {board.name}
        </NavLink>
      ))}
    </aside>
  );
}
