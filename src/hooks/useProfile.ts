import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';

export function useProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getProfile(userId as string),
    enabled: !!userId,
  });

  const update = useMutation({
    mutationFn: (name: string) => profileService.updateProfile(userId as string, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', userId] }),
  });

  const upload = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(userId as string, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', userId] }),
  });

  return {
    profile,
    isLoading,
    updateProfile: update.mutateAsync,
    uploadAvatar: upload.mutateAsync,
  };
}