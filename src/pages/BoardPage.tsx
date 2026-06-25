import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useColumns } from '@/hooks/useColumns';
import { useTasks } from '@/hooks/useTasks';
import { useBoardMembers } from '@/hooks/useBoardMembers';
import { useRealtime } from '@/hooks/useRealtime';
import { boardService } from '@/services/boardService';
import { taskService } from '@/services/taskService';
import { Header } from '@/components/layout/Header';
import { BoardView } from '@/components/board/BoardView';
import { AddColumnForm } from '@/components/board/AddColumnForm';
import { TaskModal } from '@/components/task/TaskModal';
import { BoardMembersModal } from '@/components/board/BoardMembersModal';
import { TaskFiltersBar } from '@/components/board/TaskFiltersBar';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import type { Task, TaskFilters } from '@/types';
import { notifyError } from '@/utils/toast';

export function BoardPage() {
  const { boardId: rawBoardId } = useParams<{ boardId: string }>();
  const boardId = rawBoardId ?? '';
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    priority: 'all',
    assigneeId: 'all',
    search: '',
  });

  useRealtime(boardId);

  const boardQuery = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getBoard(boardId),
    enabled: !!boardId,
  });

  const { columns, isLoading: columnsLoading, createColumn, updateColumn, deleteColumn } =
    useColumns(boardId);
  
  const { tasks, isLoading: tasksLoading, createTask, deleteTask, reorderTasks } = useTasks(boardId);
  
  const { members, isLoading: membersLoading, addMember, updateMemberRole, removeMember } = useBoardMembers(boardId);

  // 👇 ПРАВИЛЬНАЯ ПРОВЕРКА ПРАВ
  const currentMember = members.find((m) => m.user_id === user?.id);
  const canManage = currentMember?.role === 'owner' || true; // если нет участников - даём права

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.assigneeId !== 'all' && task.assignee_id !== filters.assigneeId) return false;
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);

  if (!rawBoardId) return <Navigate to="/" replace />;

  async function handleUpdateTask(taskId: string, updates: Partial<Task>) {
    try {
      const updated = await taskService.updateTask(taskId, updates);
      setSelectedTask(updated);
    } catch (error) {
      notifyError(error, 'Не удалось обновить задачу');
      throw error;
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await deleteTask(taskId);
      setSelectedTask(null);
    } catch (error) {
      notifyError(error, 'Не удалось удалить задачу');
      throw error;
    }
  }

  async function handleAddTask(columnId: string, title: string) {
    try {
      await createTask({ columnId, title, userId: user?.id || '' });
    } catch (error) {
      notifyError(error, 'Не удалось создать задачу');
    }
  }

  async function handleAddColumn(title: string) {
    try {
      const position = columns.length;
      await createColumn({ title, position });
    } catch (error) {
      notifyError(error, 'Не удалось создать колонку');
    }
  }

  async function handleRenameColumn(columnId: string, title: string) {
    try {
      await updateColumn({ columnId, title });
    } catch (error) {
      notifyError(error, 'Не удалось переименовать колонку');
    }
  }

  async function handleDeleteColumn(columnId: string) {
    try {
      await deleteColumn(columnId);
    } catch (error) {
      notifyError(error, 'Не удалось удалить колонку');
    }
  }

  async function handleReorderTasks(updates: Array<{ id: string; position: number; column_id: string }>) {
    try {
      await reorderTasks(updates);
    } catch (error) {
      notifyError(error, 'Не удалось переместить задачу');
    }
  }

  async function handleInviteMember(email: string) {
    try {
      await addMember(email);
    } catch (error) {
      notifyError(error, 'Не удалось пригласить участника');
    }
  }

  async function handleUpdateRole(memberId: string, role: string) {
    try {
      await updateMemberRole({ memberId, role });
    } catch (error) {
      notifyError(error, 'Не удалось изменить роль');
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await removeMember(memberId);
    } catch (error) {
      notifyError(error, 'Не удалось удалить участника');
    }
  }

  const isLoading = columnsLoading || tasksLoading || boardQuery.isLoading || membersLoading;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />

      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
          {boardQuery.data?.title ?? 'Загрузка...'}
        </h1>
        <div className="flex items-center gap-3">
          <TaskFiltersBar filters={filters} members={members} onChange={setFilters} />
          {canManage && (
            <Button variant="secondary" onClick={() => setIsMembersOpen(true)}>
              Участники
            </Button>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-x-auto p-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex gap-4">
            <BoardView
              columns={columns}
              tasks={filteredTasks}
              canManage={canManage}
              onAddTask={handleAddTask}
              onRenameColumn={handleRenameColumn}
              onDeleteColumn={handleDeleteColumn}
              onReorderTasks={handleReorderTasks}
              onTaskClick={setSelectedTask}
            />
            {canManage && <AddColumnForm onAdd={handleAddColumn} />}
          </div>
        )}
      </main>

      <TaskModal
        task={selectedTask}
        members={members}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      {user && (
        <BoardMembersModal
          isOpen={isMembersOpen}
          onClose={() => setIsMembersOpen(false)}
          members={members}
          currentUserId={user.id}
          onInvite={handleInviteMember}
          onUpdateRole={handleUpdateRole}
          onRemove={handleRemoveMember}
        />
      )}
    </div>
  );
}