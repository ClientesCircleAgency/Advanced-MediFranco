import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {
  Patient,
  ClinicAppointment,
  Professional,
  Specialty,
  ConsultationType,
  WaitlistItem,
  Room,
  AppointmentStatus,
} from '@/types/clinic';
import {
  mockPatients,
  mockAppointments,
  mockProfessionals,
  mockSpecialties,
  mockConsultationTypes,
  mockWaitlist,
  mockRooms,
} from '@/data/clinicMockData';

interface ClinicContextType {
  // Dados
  patients: Patient[];
  appointments: ClinicAppointment[];
  professionals: Professional[];
  specialties: Specialty[];
  consultationTypes: ConsultationType[];
  waitlist: WaitlistItem[];
  rooms: Room[];

  // Ações - Pacientes
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  findPatientByNif: (nif: string) => Patient | undefined;
  getPatientById: (id: string) => Patient | undefined;

  // Ações - Consultas
  addAppointment: (appointment: Omit<ClinicAppointment, 'id' | 'createdAt' | 'updatedAt'>) => ClinicAppointment;
  updateAppointment: (id: string, data: Partial<ClinicAppointment>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: string) => ClinicAppointment[];
  getAppointmentsByPatient: (patientId: string) => ClinicAppointment[];

  // Ações - Lista de Espera
  addToWaitlist: (item: Omit<WaitlistItem, 'id' | 'createdAt'>) => void;
  removeFromWaitlist: (id: string) => void;
  updateWaitlistItem: (id: string, data: Partial<WaitlistItem>) => void;

  // Ações - Profissionais
  addProfessional: (professional: Omit<Professional, 'id'>) => void;
  updateProfessional: (id: string, data: Partial<Professional>) => void;
  removeProfessional: (id: string) => void;

  // Ações - Tipos de Consulta
  addConsultationType: (type: Omit<ConsultationType, 'id'>) => void;
  updateConsultationType: (id: string, data: Partial<ConsultationType>) => void;
  removeConsultationType: (id: string) => void;

  // Helpers
  getProfessionalById: (id: string) => Professional | undefined;
  getSpecialtyById: (id: string) => Specialty | undefined;
  getConsultationTypeById: (id: string) => ConsultationType | undefined;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<ClinicAppointment[]>(mockAppointments);
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>(mockWaitlist);
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>(mockConsultationTypes);

  // Dados estáticos
  const specialties = mockSpecialties;
  const rooms = mockRooms;

  // Helpers
  const getProfessionalById = useCallback(
    (id: string) => professionals.find((p) => p.id === id),
    [professionals]
  );

  const getSpecialtyById = useCallback(
    (id: string) => specialties.find((s) => s.id === id),
    [specialties]
  );

  const getConsultationTypeById = useCallback(
    (id: string) => consultationTypes.find((c) => c.id === id),
    [consultationTypes]
  );

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients]
  );

  const findPatientByNif = useCallback(
    (nif: string) => patients.find((p) => p.nif === nif),
    [patients]
  );

  // Ações - Pacientes
  const addPatient = useCallback((patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPatients((prev) => [...prev, newPatient]);
    return newPatient;
  }, []);

  const updatePatient = useCallback((id: string, data: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }, []);

  // Ações - Consultas
  const addAppointment = useCallback(
    (appointmentData: Omit<ClinicAppointment, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newAppointment: ClinicAppointment = {
        ...appointmentData,
        id: `apt-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    },
    []
  );

  const updateAppointment = useCallback((id: string, data: Partial<ClinicAppointment>) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    updateAppointment(id, { status });
  }, [updateAppointment]);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getAppointmentsByDate = useCallback(
    (date: string) => appointments.filter((a) => a.date === date),
    [appointments]
  );

  const getAppointmentsByPatient = useCallback(
    (patientId: string) => appointments.filter((a) => a.patientId === patientId),
    [appointments]
  );

  // Ações - Lista de Espera
  const addToWaitlist = useCallback((itemData: Omit<WaitlistItem, 'id' | 'createdAt'>) => {
    const newItem: WaitlistItem = {
      ...itemData,
      id: `wait-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWaitlist((prev) => [...prev, newItem]);
  }, []);

  const removeFromWaitlist = useCallback((id: string) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWaitlistItem = useCallback((id: string, data: Partial<WaitlistItem>) => {
    setWaitlist((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...data } : w))
    );
  }, []);

  // Ações - Profissionais
  const addProfessional = useCallback((data: Omit<Professional, 'id'>) => {
    const newProfessional: Professional = {
      ...data,
      id: `prof-${Date.now()}`,
    };
    setProfessionals((prev) => [...prev, newProfessional]);
  }, []);

  const updateProfessional = useCallback((id: string, data: Partial<Professional>) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }, []);

  const removeProfessional = useCallback((id: string) => {
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Ações - Tipos de Consulta
  const addConsultationType = useCallback((data: Omit<ConsultationType, 'id'>) => {
    const newType: ConsultationType = {
      ...data,
      id: `type-${Date.now()}`,
    };
    setConsultationTypes((prev) => [...prev, newType]);
  }, []);

  const updateConsultationType = useCallback((id: string, data: Partial<ConsultationType>) => {
    setConsultationTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  }, []);

  const removeConsultationType = useCallback((id: string) => {
    setConsultationTypes((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      patients,
      appointments,
      professionals,
      specialties,
      consultationTypes,
      waitlist,
      rooms,
      addPatient,
      updatePatient,
      findPatientByNif,
      getPatientById,
      addAppointment,
      updateAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      getAppointmentsByDate,
      getAppointmentsByPatient,
      addToWaitlist,
      removeFromWaitlist,
      updateWaitlistItem,
      addProfessional,
      updateProfessional,
      removeProfessional,
      addConsultationType,
      updateConsultationType,
      removeConsultationType,
      getProfessionalById,
      getSpecialtyById,
      getConsultationTypeById,
    }),
    [
      patients,
      appointments,
      waitlist,
      professionals,
      specialties,
      consultationTypes,
      rooms,
      addPatient,
      updatePatient,
      findPatientByNif,
      getPatientById,
      addAppointment,
      updateAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      getAppointmentsByDate,
      getAppointmentsByPatient,
      addToWaitlist,
      removeFromWaitlist,
      updateWaitlistItem,
      addProfessional,
      updateProfessional,
      removeProfessional,
      addConsultationType,
      updateConsultationType,
      removeConsultationType,
      getProfessionalById,
      getSpecialtyById,
      getConsultationTypeById,
    ]
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
