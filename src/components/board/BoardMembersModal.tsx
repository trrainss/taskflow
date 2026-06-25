import { useState, type FormEvent } from 'react';
import type { BoardMember, BoardRole } from '@/types';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { Avatar } from '@/components/shared/Avatar';
import { notifyError, notifySuccess } from '@/utils/toast';

interface BoardMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: BoardMember[];
  currentUserId: string;
  onInvite: (email: string) => Promise<unknown>;
  onUpdateRole: (memberId: string, role: BoardRole) => Promise<unknown>;
  onRemove: (memberId: string) => Promise<unknown>;
}

export function BoardMembersModal({
  isOpen,
  onClose,
  members,
  currentUserId,
  onInvite,
  onUpdateRole,
  onRemove,
}: BoardMembersModalProps) {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setIsInviting(true);
    try {
      await onInvite(email.trim());
      notifySuccess('Участник добавлен');
      setEmail('');
    } catch (error) {
      notifyError(error, 'Не удалось добавить участника');
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRoleChange(memberId: string, role: BoardRole) {
    try {
      await onUpdateRole(memberId, role);
    } catch (error) {
      notifyError(error, 'Не удалось изменить роль');
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm('Удалить участника с доски?')) return;
    try {
      await onRemove(memberId);
      notifySuccess('Участник удалён');
    } catch (error) {
      notifyError(error, 'Не удалось удалить участника');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Участники доски">
      <form onSubmit={handleInvite} className="mb-4 flex gap-2">
        <TextField
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" isLoading={isInviting}>
          Добавить
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-2 dark:border-slate-700"
          >
            <div className="flex items-center gap-2">
              <Avatar
                name={member.profile?.display_name ?? '?'}
                avatarUrl={member.profile?.avatar_url}
                size="sm"
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {member.profile?.display_name}
                {member.user_id === currentUserId && ' (вы)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {member.role === 'owner' ? (
                <span className="text-xs font-medium uppercase text-brand-600 dark:text-brand-400">
                  Владелец
                </span>
              ) : (
                <>
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as BoardRole)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="member">Участник</option>
                    <option value="owner">Владелец</option>
                  </select>
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Удалить
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
