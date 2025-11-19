// Storage service - localStorage ora, Supabase poi
// Manteniamo un'interfaccia comune per facilitare la migrazione

import type {
  Patient,
  Document,
  Treatment,
  Appointment,
  Quote,
  Payment,
  TreatmentPrice,
} from "../types";

const STORAGE_KEYS = {
  PATIENTS: "dentist_patients",
  DOCUMENTS: "dentist_documents",
  TREATMENTS: "dentist_treatments",
  APPOINTMENTS: "dentist_appointments",
  QUOTES: "dentist_quotes",
  PAYMENTS: "dentist_payments",
  TREATMENT_PRICES: "dentist_treatment_prices",
};

// Helper generico per localStorage
class LocalStorageService<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find((item: any) => item.id === id);
  }

  create(item: T): T {
    const items = this.getAll();
    items.push(item);
    localStorage.setItem(this.key, JSON.stringify(items));
    return item;
  }

  update(id: string, updates: Partial<T>): T | null {
    const items = this.getAll();
    const index = items.findIndex(
      (item: any) => item.id === id
    );

    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    localStorage.setItem(this.key, JSON.stringify(items));
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(
      (item: any) => item.id !== id
    );

    if (filtered.length === items.length) return false;

    localStorage.setItem(
      this.key,
      JSON.stringify(filtered)
    );
    return true;
  }

  query(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }
}

// Services per ogni entità
export const patientsService =
  new LocalStorageService<Patient>(STORAGE_KEYS.PATIENTS);
export const documentsService =
  new LocalStorageService<Document>(STORAGE_KEYS.DOCUMENTS);
export const treatmentsService =
  new LocalStorageService<Treatment>(
    STORAGE_KEYS.TREATMENTS
  );
export const appointmentsService =
  new LocalStorageService<Appointment>(
    STORAGE_KEYS.APPOINTMENTS
  );
export const quotesService = new LocalStorageService<Quote>(
  STORAGE_KEYS.QUOTES
);
export const paymentsService =
  new LocalStorageService<Payment>(STORAGE_KEYS.PAYMENTS);
export const treatmentPricesService =
  new LocalStorageService<TreatmentPrice>(
    STORAGE_KEYS.TREATMENT_PRICES
  );

// Funzione di utilità per generare ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

// Backup e restore (simulazione - poi andrà su Supabase)
export const backupData = (): string => {
  const backup = {
    patients: patientsService.getAll(),
    documents: documentsService.getAll(),
    treatments: treatmentsService.getAll(),
    appointments: appointmentsService.getAll(),
    quotes: quotesService.getAll(),
    payments: paymentsService.getAll(),
    treatmentPrices: treatmentPricesService.getAll(),
    timestamp: new Date().toISOString(),
  };
  return JSON.stringify(backup, null, 2);
};

export const restoreData = (
  backupJson: string
): boolean => {
  try {
    const backup = JSON.parse(backupJson);

    localStorage.setItem(
      STORAGE_KEYS.PATIENTS,
      JSON.stringify(backup.patients || [])
    );
    localStorage.setItem(
      STORAGE_KEYS.DOCUMENTS,
      JSON.stringify(backup.documents || [])
    );
    localStorage.setItem(
      STORAGE_KEYS.TREATMENTS,
      JSON.stringify(backup.treatments || [])
    );
    localStorage.setItem(
      STORAGE_KEYS.APPOINTMENTS,
      JSON.stringify(backup.appointments || [])
    );
    localStorage.setItem(
      STORAGE_KEYS.QUOTES,
      JSON.stringify(backup.quotes || [])
    );
    localStorage.setItem(
      STORAGE_KEYS.PAYMENTS,
      JSON.stringify(backup.payments || [])
    );
    localStorage.setItem(
      STORAGE_KEYS.TREATMENT_PRICES,
      JSON.stringify(backup.treatmentPrices || [])
    );

    return true;
  } catch (error) {
    console.error("Errore nel ripristino:", error);
    return false;
  }
};

// Inizializzazione dati demo
export const initializeDemoData = () => {
  if (patientsService.getAll().length === 0) {
    // Prezzi trattamenti default
    const defaultPrices: TreatmentPrice[] = [
      {
        id: generateId(),
        name: "Pulizia dentale",
        description: "Igiene professionale",
        defaultPrice: 80,
        category: "Igiene",
      },
      {
        id: generateId(),
        name: "Otturazione",
        description: "Otturazione in composito",
        defaultPrice: 120,
        category: "Conservativa",
      },
      {
        id: generateId(),
        name: "Estrazione",
        description: "Estrazione semplice",
        defaultPrice: 100,
        category: "Chirurgia",
      },
      {
        id: generateId(),
        name: "Visita di controllo",
        description: "Controllo generale",
        defaultPrice: 50,
        category: "Visite",
      },
      {
        id: generateId(),
        name: "Sbiancamento",
        description: "Sbiancamento professionale",
        defaultPrice: 300,
        category: "Estetica",
      },
    ];

    defaultPrices.forEach((price) =>
      treatmentPricesService.create(price)
    );
  }
};
