import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../common/Button";
import { appointmentsService } from "../../services/storage";
import type { Appointment } from "../../types";
import styles from "./QuickEditAppointment.module.scss";

interface QuickEditAppointmentProps {
  appointment: Appointment;
  onClose: () => void;
  onSave: () => void;
}

export const QuickEditAppointment = ({
  appointment,
  onClose,
  onSave,
}: QuickEditAppointmentProps) => {
  const [formData, setFormData] = useState({
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    notes: appointment.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    appointmentsService.update(appointment.id, formData);
    onSave();
    onClose();
  };

  const handleStatusChange = (newStatus: string) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus as
        | "scheduled"
        | "confirmed"
        | "cancelled"
        | "completed",
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Sei sicuro di voler eliminare questo appuntamento?"
      )
    ) {
      appointmentsService.delete(appointment.id);
      onSave();
      onClose();
    }
  };

  const statusLabels: Record<string, string> = {
    scheduled: "Programmato",
    confirmed: "Confermato",
    completed: "Completato",
    cancelled: "Annullato",
  };

  const statusIcons: Record<string, string> = {
    scheduled: "📋",
    confirmed: "✅",
    completed: "🏁",
    cancelled: "❌",
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles["quick-edit-modal"]}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={styles["modal-content"]}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          <div className={styles["modal-header"]}>
            <h3>📝 Modifica Appuntamento</h3>
            <button
              className={styles["close-button"]}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles["modal-body"]}>
              <div className={styles["appointment-info"]}>
                <div className={styles["patient-avatar"]}>
                  {appointment.patientName
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className={styles["info-details"]}>
                  <div className={styles["patient-name"]}>
                    {appointment.patientName}
                  </div>
                  <div className={styles["date-time"]}>
                    <span className={styles.item}>
                      📅{" "}
                      {new Date(
                        appointment.date
                      ).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className={styles.item}>
                      🕐 {appointment.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles["form-section"]}>
                <h4>Stato Appuntamento</h4>
                <div className={styles["status-buttons"]}>
                  {Object.entries(statusLabels).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={`${
                          styles["status-button"]
                        } ${styles[value]} ${
                          formData.status === value
                            ? styles.active
                            : ""
                        }`}
                        onClick={() =>
                          handleStatusChange(value)
                        }
                      >
                        {statusIcons[value]} {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className={styles["form-section"]}>
                <h4>Modifica Orario</h4>
                <div className={styles["form-row"]}>
                  <div className={styles["form-group"]}>
                    <label htmlFor="date">Data</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles["form-group"]}>
                    <label htmlFor="time">Ora</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className={styles["form-section"]}>
                <h4>Note</h4>
                <div className={styles["form-row"]}>
                  <div className={styles["form-group"]}>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Aggiungi note per questo appuntamento..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles["modal-footer"]}>
              <div className={styles["left-actions"]}>
                <Button
                  type="button"
                  variant="danger"
                  size="small"
                  onClick={handleDelete}
                >
                  🗑️ Elimina
                </Button>
              </div>
              <div className={styles["right-actions"]}>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={onClose}
                >
                  Annulla
                </Button>
                <Button type="submit" size="small">
                  💾 Salva
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
