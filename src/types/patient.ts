export interface PatientUser {
  id: string;
  user_id: string;
  patient_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  nif: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointment_reminders: boolean;
}

export interface OnlineAppointment {
  id: string;
  patient_user_id: string;
  professional_id: string;
  specialty_id: string;
  consultation_type_id: string | null;
  date: string;
  time: string;
  duration: number;
  video_provider: string;
  video_room_url: string | null;
  video_room_id: string | null;
  status: OnlineAppointmentStatus;
  price_cents: number;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  reason: string | null;
  notes: string | null;
  final_notes: string | null;
  prescription: string | null;
  confirmed_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  patient_rating: number | null;
  patient_feedback: string | null;
  review_opt_out: boolean;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

export type OnlineAppointmentStatus =
  | 'scheduled'
  | 'pre_confirmed'
  | 'confirmed'
  | 'paid'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'waived';

export interface PatientDocument {
  id: string;
  patient_user_id: string;
  uploaded_by_user_id: string;
  title: string;
  description: string | null;
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  storage_path: string;
  appointment_id: string | null;
  online_appointment_id: string | null;
  is_confidential: boolean;
  created_at: string;
}

export type DocumentType =
  | 'prescription'
  | 'report'
  | 'exam_result'
  | 'imaging'
  | 'referral'
  | 'invoice'
  | 'other';

export interface PatientNotification {
  id: string;
  patient_user_id: string;
  type: string;
  title: string;
  body: string | null;
  online_appointment_id: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}
