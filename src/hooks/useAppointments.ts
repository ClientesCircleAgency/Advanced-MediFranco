import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AppointmentRow, AppointmentInsert, AppointmentUpdate, AppointmentStatus } from '@/types/database';

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async (): Promise<AppointmentRow[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAppointmentsByDate(date: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'date', date],
    queryFn: async (): Promise<AppointmentRow[]> => {
      if (!date) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!date,
  });
}

export function useAppointmentsByPatient(patientId: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: async (): Promise<AppointmentRow[]> => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false })
        .order('time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId,
  });
}

export function useAddAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AppointmentUpdate }) => {
      const { data: updated, error } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
      finalNotes,
      reviewOptOut = false,
    }: {
      id: string;
      status: AppointmentStatus;
      reason?: string;
      finalNotes?: string;
      reviewOptOut?: boolean;
    }) => {
      const { data, error } = await supabase.rpc('transition_appointment_status', {
        p_appointment_id: id,
        p_new_status: status,
        p_reason: reason ?? null,
        p_final_notes: finalNotes ?? null,
        p_review_opt_out: reviewOptOut,
        p_metadata: { source: 'admin_dashboard' },
      });

      if (!error) return data;

      const functionMissing =
        error.code === 'PGRST202' ||
        error.message?.toLowerCase().includes('transition_appointment_status');

      if (!functionMissing) throw error;

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (fallbackError) throw fallbackError;
      return fallbackData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
