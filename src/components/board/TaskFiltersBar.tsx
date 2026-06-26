import type { TaskFilters, BoardMember } from '@/types';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  members: BoardMember[];
  onChange: (filters: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, members, onChange }: TaskFiltersBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="text"
        placeholder="Поиск..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      />

      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TaskFilters['priority'] })}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      >
        <option value="all">Все приоритеты</option>
        <option value="low">Низкий</option>
        <option value="medium">Средний</option>
        <option value="high">Высокий</option>
      </select>

      <select
        value={filters.assigneeId}
        onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      >
        <option value="all">Все исполнители</option>
        {members.map((member) => {
          const profile = member.profile;
          const name = profile?.name || 'User';
          return (
            <option key={member.id} value={member.user_id}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}