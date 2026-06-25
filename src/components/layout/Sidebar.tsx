import { Link } from 'react-router-dom';
import type { BoardWithRole } from '@/types';

interface SidebarProps {
  boards: BoardWithRole[];
  currentBoardId?: string;
}

export function Sidebar({ boards, currentBoardId }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Мои доски
      </h2>
      <nav className="space-y-1">
        {boards.map((board) => (
          <Link
            key={board.id}
            to={`/board/${board.id}`}
            className={`block rounded-lg px-3 py-2 text-sm transition ${
              board.id === currentBoardId
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {board.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}