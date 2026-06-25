import { useState, type FormEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, Profile, Task } from '@/types';
import { TaskCard } from '@/components/board/TaskCard';
import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { cn } from '@/utils/helpers';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  profilesById: Map<string, Profile>;
  canManage: boolean;
  onAddTask: (title: string) => Promise<unknown>;
  onRename: (title: string) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onTaskClick: (task: Task) => void;
}

export function BoardColumn({
  column,
  tasks,
  profilesById,
  canManage,
  onAddTask,
  onRename,
  onDelete,
  onTaskClick,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column' } });
  const [isAdding, setIsAdding] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [title, setTitle] = useState(column.title);

  async function handleAddTask(event: FormEvent) {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;
    await onAddTask(newTaskTitle.trim());
    setNewTaskTitle('');
    setIsAdding(false);
  }

  async function handleRename(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    await onRename(title.trim());
    setIsRenaming(false);
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900',
        isOver && 'ring-2 ring-brand-400',
      )}
    >
      <div className="flex items-center justify-between">
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex-1">
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRename}
              autoFocus
              className="py-1 text-sm"
            />
          </form>
        ) : (
          <h3
            className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200"
            onClick={() => canManage && setIsRenaming(true)}
          >
            {column.title}
            <span className="ml-2 text-xs font-normal text-slate-400">{tasks.length}</span>
          </h3>
        )}

        {canManage && !isRenaming && (
          <button
            onClick={onDelete}
            className="text-xs text-slate-400 hover:text-rose-500"
            aria-label="Удалить колонку"
          >
            ✕
          </button>
        )}
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={task.assignee_id ? profilesById.get(task.assignee_id) ?? null : null}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </SortableContext>

      {isAdding ? (
        <form onSubmit={handleAddTask} className="flex flex-col gap-2">
          <TextField
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Название задачи"
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Добавить
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg px-2 py-1.5 text-left text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          + Добавить задачу
        </button>
      )}
    </div>
  );
}
