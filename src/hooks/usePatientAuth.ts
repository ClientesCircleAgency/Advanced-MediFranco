import { useState, useCallback, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { PatientUser } from '@/types/patient';

interface PatientAuthState {
  user: User | null;
  session: Session | null;
  patientUser: PatientUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPatient: boolean;
}

export function usePatientAuth(): PatientAuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [patientUser, setPatientUser] = useState<PatientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatientUser = useCallback(async (userId: string): Promise<PatientUser | null> => {
    try {
      const { data, error } = await supabase
        .from('patient_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching patient user:', error);
        return null;
      }

      return data as PatientUser | null;
    } catch (error) {
      console.error('Error fetching patient user:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setIsLoading(true);
        setTimeout(() => {
          fetchPatientUser(session.user.id)
            .then(setPatientUser)
            .finally(() => setIsLoading(false));
        }, 0);
      } else {
        setPatientUser(null);
        setIsLoading(false);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setIsLoading(true);
          return fetchPatientUser(session.user.id)
            .then(setPatientUser)
            .finally(() => setIsLoading(false));
        }

        setIsLoading(false);
      })
      .catch(() => {
        setPatientUser(null);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [fetchPatientUser]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const patient = await fetchPatientUser(data.user.id);
        if (!patient) {
          await supabase.auth.signOut();
          return { success: false, error: 'Conta não encontrada. Verifique se está registado como paciente.' };
        }
        setPatientUser(patient);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
    }
  }, [fetchPatientUser]);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('patient_users')
          .insert({
            user_id: authData.user.id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone || null,
            nif: data.nif || null,
            notification_preferences: {
              email: true,
              sms: false,
              push: false,
              appointment_reminders: true,
            },
          });

        if (profileError) {
          console.error('Error creating patient profile:', profileError);
          return { success: false, error: 'Erro ao criar perfil. Contacte-nos para assistência.' };
        }

        const patient = await fetchPatientUser(authData.user.id);
        setPatientUser(patient);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Erro ao criar conta. Tente novamente.' };
    }
  }, [fetchPatientUser]);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/area-cliente/login`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Erro ao enviar email. Tente novamente.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setPatientUser(null);
  }, []);

  return {
    user,
    session,
    patientUser,
    isLoading,
    isAuthenticated: !!session && !!patientUser,
    isPatient: !!patientUser,
    login,
    register,
    resetPassword,
    logout,
  };
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone: string;
  nif: string;
  password: string;
}
