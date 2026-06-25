import { useState } from 'react';
import type { BoardMember, BoardRole } from '@/types';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { Avatar } from '@/components/shared/Avatar';
import toast from 'react-hot-toast';

interface BoardMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: BoardMember[];
  currentUserId: string;
  onInvite: (email: string) => Promise<void>;
  onUpdateRole: (memberId: string, role: BoardRole) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }
    setLoading(true);
    try {
      await onInvite(email.trim());
      setEmail('');
      toast.success('Приглашение отправлено');
    } catch (error) {
      toast.error('Не удалось пригласить пользователя');
    } finally {
      setLoading(false);
    }
  };

const handleUpdateRole = async (memberId: string, role: 'owner' | 'member') => {
  setUpdating(memberId);
  try {
    await onUpdateRole(memberId, role);
    toast.success('Роль обновлена');
  } catch (error) {
    toast.error('Не удалось обновить роль');
  } finally {
    setUpdating(null);
  }
};

  const handleRemove = async (memberId: string) => {
    if (!confirm('Удалить участника?')) return;
    try {
      await onRemove(memberId);
      toast.success('Участник удалён');
    } catch (error) {
      toast.error('Не удалось удалить участника');
    }
  };

  const currentMember = members.find((m) => m.user_id === currentUserId);
  const isOwner = currentMember?.role === 'owner';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Участники доски">
      <div className="space-y-4">
        {isOwner && (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email пользователя"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              disabled={loading}
            />
            <Button onClick={handleInvite} disabled={loading}>
              {loading ? '...' : 'Пригласить'}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {members.map((member) => {
            const isCurrentUser = member.user_id === currentUserId;
            const profile = member.profile;
            const displayName = profile?.display_name || profile?.name || 'User';

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={displayName}
                    avatarUrl={profile?.avatar_url}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {displayName}
                      {isCurrentUser && ' (вы)'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {member.role === 'owner' ? 'Владелец' : 'Участник'}
                    </p>
                  </div>
                </div>

                {isOwner && !isCurrentUser && (
                  <div className="flex gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value as BoardRole)}
                      disabled={updating === member.id}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="member">Участник</option>
                      <option value="owner">Владелец</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      disabled={updating === member.id}
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}