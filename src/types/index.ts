// Types per il progetto - preparati per Supabase

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  clinicalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  patientId: string;
  fileName: string;
  fileType: "rx" | "photo" | "pdf" | "other";
  fileUrl: string; // Per ora base64, poi sarà URL Supabase Storage
  uploadDate: string;
  description?: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  treatmentName: string;
  description: string;
  cost: number;
  date: string;
  status: "planned" | "in-progress" | "completed";
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Denormalizzato per comodità
  date: string;
  time: string;
  duration: number; // in minuti
  status:
    | "scheduled"
    | "confirmed"
    | "cancelled"
    | "completed";
  notes?: string;
  reminderSent?: boolean;
}

export interface Quote {
  id: string;
  patientId: string;
  patientName: string;
  items: QuoteItem[];
  totalAmount: number;
  createdAt: string;
  validUntil: string;
  status: "draft" | "sent" | "accepted" | "rejected";
}

export interface QuoteItem {
  treatmentName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  patientId: string;
  quoteId?: string;
  amount: number;
  date: string;
  method: "cash" | "card" | "transfer" | "other";
  notes?: string;
}

export interface TreatmentPrice {
  id: string;
  name: string;
  description: string;
  defaultPrice: number;
  category: string;
}

// Dashboard stats
export interface DashboardStats {
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  patientsWithPendingPayments: Array<{
    patient: Patient;
    pendingAmount: number;
  }>;
  totalPatients: number;
  todayRevenue: number;
}
