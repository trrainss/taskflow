import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';


export function useProfiles(userIds: string[]) {
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles', userIds],
    queryFn: async () => {
      if (!userIds.length) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (error) throw error;
      return data || [];
    },
    enabled: userIds.length > 0,
  });

  const profilesById = new Map(profiles.map((p) => [p.id, p]));

  return { profiles, profilesById };
}