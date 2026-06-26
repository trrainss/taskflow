import { Link } from 'react-router-dom';
import type { BoardWithRole } from '@/types';

interface BoardListProps {
  boards: BoardWithRole[];
}

export function BoardList({ boards }: BoardListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <Link
          key={board.id}
          to={`/board/${board.id}`}
          className="group rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-800"
        >
          <h3 className="font-medium text-slate-900 dark:text-white">{board.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {board.role === 'owner' ? 'Владелец' : 'Участник'}
          </p>
        </Link>
      ))}
    </div>
  );
}