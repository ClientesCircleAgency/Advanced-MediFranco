import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OnlineAppointmentRow } from '@/types/database';

export function useOnlineAppointments() {
  return useQuery({
    queryKey: ['online_appointments'],
    queryFn: async (): Promise<OnlineAppointmentRow[]> => {
      const { data, error } = await supabase
        .from('online_appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}
