import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "../layout/Layout";
import { Button } from "../common/Button";
import {
  patientsService,
  generateId,
} from "../../services/storage";
import type { Patient } from "../../types";
import styles from "./Patients.module.scss";

export const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    const allPatients = patientsService.getAll();
    setPatients(allPatients);
  };

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(search) ||
      patient.email.toLowerCase().includes(search) ||
      patient.phone.toLowerCase().includes(search)
    );
  });

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  const handleDeletePatient = (patientId: string) => {
    if (
      window.confirm(
        "Sei sicuro di voler eliminare questo paziente?"
      )
    ) {
      patientsService.delete(patientId);
      loadPatients();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPatient(null);
  };

  const handleSavePatient = () => {
    loadPatients();
    handleCloseModal();
  };

  return (
    <Layout
      title="Pazienti"
      actions={
        <Button onClick={handleAddPatient}>
          ➕ Aggiungi Paziente
        </Button>
      }
    >
      <div className={styles["patients-page"]}>
        <div className={styles["page-header"]}>
          <div className={styles["search-bar"]}>
            <span className={styles["search-icon"]}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Cerca pazienti per nome, email o telefono..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className={styles["empty-state"]}>
            <div className={styles.icon}>👥</div>
            <h3>
              {searchTerm
                ? "Nessun paziente trovato"
                : "Nessun paziente registrato"}
            </h3>
            <p>
              {searchTerm
                ? "Prova a modificare la ricerca"
                : "Inizia aggiungendo il primo paziente"}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddPatient}>
                ➕ Aggiungi primo paziente
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className={styles["patients-grid"]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  className={styles["patient-card"]}
                  onClick={() => handleEditPatient(patient)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles["patient-avatar"]}>
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles["patient-info"]}>
                    <div className={styles["patient-name"]}>
                      {patient.name}
                    </div>
                    <div
                      className={styles["patient-contact"]}
                    >
                      <div
                        className={styles["contact-item"]}
                      >
                        📞 {patient.phone}
                      </div>
                      <div
                        className={styles["contact-item"]}
                      >
                        ✉️ {patient.email}
                      </div>
                    </div>
                    {patient.clinicalNotes && (
                      <div
                        className={styles["patient-notes"]}
                      >
                        {patient.clinicalNotes.substring(
                          0,
                          100
                        )}
                        {patient.clinicalNotes.length > 100
                          ? "..."
                          : ""}
                      </div>
                    )}
                  </div>
                  <div
                    className={styles["patient-actions"]}
                  >
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePatient(patient.id);
                      }}
                      variant="danger"
                    >
                      🗑️
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {showModal && (
          <PatientModal
            patient={editingPatient}
            onClose={handleCloseModal}
            onSave={handleSavePatient}
          />
        )}
      </div>
    </Layout>
  );
};

// Modal per aggiungere/modificare paziente
interface PatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSave: () => void;
}

const PatientModal = ({
  patient,
  onClose,
  onSave,
}: PatientModalProps) => {
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    clinicalNotes: patient?.clinicalNotes || "",
  });

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Il telefono è obbligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email è obbligatoria";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Email non valida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const now = new Date().toISOString();

    if (patient) {
      // Modifica paziente esistente
      patientsService.update(patient.id, {
        ...formData,
        updatedAt: now,
      });
    } else {
      // Crea nuovo paziente
      const newPatient: Patient = {
        id: generateId(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      patientsService.create(newPatient);
    }

    onSave();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Rimuovi l'errore quando l'utente inizia a scrivere
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div
      className={styles["modal-overlay"]}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["modal-header"]}>
          <h2>
            {patient
              ? "Modifica Paziente"
              : "Nuovo Paziente"}
          </h2>
          <button
            className={styles["close-button"]}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles["modal-body"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="name">Nome completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Mario Rossi"
              />
              {errors.name && (
                <div className={styles.error}>
                  {errors.name}
                </div>
              )}
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="phone">Telefono *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+39 333 1234567"
              />
              {errors.phone && (
                <div className={styles.error}>
                  {errors.phone}
                </div>
              )}
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="mario.rossi@email.com"
              />
              {errors.email && (
                <div className={styles.error}>
                  {errors.email}
                </div>
              )}
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="clinicalNotes">
                Note cliniche
              </label>
              <textarea
                id="clinicalNotes"
                name="clinicalNotes"
                value={formData.clinicalNotes}
                onChange={handleChange}
                placeholder="Allergie, condizioni particolari, note importanti..."
              />
            </div>
          </div>

          <div className={styles["modal-footer"]}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Annulla
            </Button>
            <Button type="submit">
              {patient
                ? "Salva modifiche"
                : "Crea paziente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
