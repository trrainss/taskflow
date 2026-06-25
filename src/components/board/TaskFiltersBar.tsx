import type { BoardMember, TaskFilters } from '@/types';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  members: BoardMember[];
  onChange: (filters: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, members, onChange }: TaskFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Поиск задач..."
        className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      />

      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TaskFilters['priority'] })}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      >
        <option value="all">Любой приоритет</option>
        <option value="low">Низкий</option>
        <option value="medium">Средний</option>
        <option value="high">Высокий</option>
      </select>

      <select
        value={filters.assigneeId}
        onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      >
        <option value="all">Любой исполнитель</option>
        {members.map((member) => (
          <option key={member.user_id} value={member.user_id}>
            {member.profile?.display_name}
          </option>
        ))}
      </select>
    </div>
  );
}
