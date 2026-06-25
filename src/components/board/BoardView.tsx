import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { Column, Task } from '@/types';
import { BoardColumn } from '@/components/board/BoardColumn';
import { TaskCard } from '@/components/board/TaskCard';
import { useProfiles } from '@/hooks/useProfiles';
import { notifyError } from '@/utils/toast';

interface BoardViewProps {
  columns: Column[];
  tasks: Task[];
  canManage: boolean;
  onAddTask: (columnId: string, title: string) => Promise<unknown>;
  onRenameColumn: (columnId: string, title: string) => Promise<unknown>;
  onDeleteColumn: (columnId: string) => Promise<unknown>;
  onReorderTasks: (
    updates: Array<{ id: string; position: number; column_id: string }>,
  ) => void;
  onTaskClick: (task: Task) => void;
}

export function BoardView({
  columns,
  tasks,
  canManage,
  onAddTask,
  onRenameColumn,
  onDeleteColumn,
  onReorderTasks,
  onTaskClick,
}: BoardViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const assigneeIds = tasks
    .map((t) => t.assignee_id)
    .filter((id): id is string => id !== null);
  const { profilesById } = useProfiles(assigneeIds);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function tasksByColumn(columnId: string): Task[] {
    return tasks.filter((t) => t.column_id === columnId).sort((a, b) => a.position - b.position);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskItem = tasks.find((t) => t.id === active.id);
    if (!activeTaskItem) return;

    const overData = over.data.current as { type?: string; columnId?: string } | undefined;
    const targetColumnId =
      overData?.type === 'task' ? overData.columnId! : (over.id as string);

    if (!columns.some((c) => c.id === targetColumnId)) return;

    const sourceColumnTasks = tasksByColumn(activeTaskItem.column_id).filter(
      (t) => t.id !== activeTaskItem.id,
    );
    const targetColumnTasks =
      targetColumnId === activeTaskItem.column_id
        ? sourceColumnTasks
        : tasksByColumn(targetColumnId);

    let insertIndex = targetColumnTasks.length;
    if (overData?.type === 'task') {
      const overIndex = targetColumnTasks.findIndex((t) => t.id === over.id);
      if (overIndex !== -1) insertIndex = overIndex;
    }

    const newTargetList = [...targetColumnTasks];
    newTargetList.splice(insertIndex, 0, activeTaskItem);

    const updates = newTargetList.map((task, index) => ({
      id: task.id,
      position: index,
      column_id: targetColumnId,
    }));

    try {
      onReorderTasks(updates);
    } catch (error) {
      notifyError(error, 'Не удалось переместить задачу');
    }
  }

  // Обработчики с try/catch для отлова ошибок
  const handleAddTask = async (columnId: string, title: string) => {
    try {
      await onAddTask(columnId, title);
    } catch (error) {
      notifyError(error, 'Не удалось создать задачу');
    }
  };

  const handleRenameColumn = async (columnId: string, title: string) => {
    try {
      await onRenameColumn(columnId, title);
    } catch (error) {
      notifyError(error, 'Не удалось переименовать колонку');
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await onDeleteColumn(columnId);
    } catch (error) {
      notifyError(error, 'Не удалось удалить колонку');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn(column.id)}
            profilesById={profilesById}
            canManage={canManage}
            onAddTask={(title) => handleAddTask(column.id, title)}
            onRename={(title) => handleRenameColumn(column.id, title)}
            onDelete={() => handleDeleteColumn(column.id)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            assignee={
              activeTask.assignee_id ? profilesById.get(activeTask.assignee_id) ?? null : null
            }
            onClick={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}