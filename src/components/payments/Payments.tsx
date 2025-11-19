import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "../layout/Layout";
import { Button } from "../common/Button";
import {
  paymentsService,
  patientsService,
  quotesService,
  generateId,
} from "../../services/storage";
import type { Payment, Patient, Quote } from "../../types";
import styles from "./Payments.module.scss";

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filterMethod, setFilterMethod] =
    useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<Payment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPayments(paymentsService.getAll());
    setPatients(patientsService.getAll());
    setQuotes(quotesService.getAll());
  };

  const filteredPayments = payments
    .filter((payment) => {
      const methodMatch =
        filterMethod === "all" ||
        payment.method === filterMethod;
      const dateMatch =
        !filterDate || payment.date.startsWith(filterDate);
      return methodMatch && dateMatch;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Calcola statistiche
  const totalRevenue = payments.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const thisMonthRevenue = payments
    .filter((p) =>
      p.date.startsWith(
        new Date().toISOString().slice(0, 7)
      )
    )
    .reduce((sum, p) => sum + p.amount, 0);
  const todayRevenue = payments
    .filter((p) =>
      p.date.startsWith(
        new Date().toISOString().slice(0, 10)
      )
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowModal(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleSavePayment = () => {
    loadData();
    handleCloseModal();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "💵 Contanti",
      card: "💳 Carta",
      transfer: "🏦 Bonifico",
      other: "📝 Altro",
    };
    return labels[method] || method;
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(
      (p) => p.id === patientId
    );
    return patient?.name || "Paziente sconosciuto";
  };

  const getQuoteInfo = (quoteId?: string) => {
    if (!quoteId) return null;
    return quotes.find((q) => q.id === quoteId);
  };

  return (
    <Layout
      title="Pagamenti"
      actions={
        <Button onClick={handleAddPayment}>
          ➕ Nuovo Pagamento
        </Button>
      }
    >
      <div className={styles["payments-page"]}>
        <motion.div
          className={styles["stats-cards"]}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={styles["stat-card"]}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div className={styles["stat-label"]}>Oggi</div>
            <div
              className={`${styles["stat-value"]} ${styles.success}`}
            >
              {formatCurrency(todayRevenue)}
            </div>
          </motion.div>
          <motion.div
            className={styles["stat-card"]}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div className={styles["stat-label"]}>
              Questo Mese
            </div>
            <div
              className={`${styles["stat-value"]} ${styles.success}`}
            >
              {formatCurrency(thisMonthRevenue)}
            </div>
          </motion.div>
          <motion.div
            className={styles["stat-card"]}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div className={styles["stat-label"]}>
              Totale
            </div>
            <div className={styles["stat-value"]}>
              {formatCurrency(totalRevenue)}
            </div>
          </motion.div>
          <motion.div
            className={styles["stat-card"]}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div className={styles["stat-label"]}>
              Transazioni
            </div>
            <div className={styles["stat-value"]}>
              {payments.length}
            </div>
          </motion.div>
        </motion.div>

        <div className={styles["page-header"]}>
          <div className={styles.filters}>
            <label>Metodo:</label>
            <select
              value={filterMethod}
              onChange={(e) =>
                setFilterMethod(e.target.value)
              }
            >
              <option value="all">Tutti</option>
              <option value="cash">Contanti</option>
              <option value="card">Carta</option>
              <option value="transfer">Bonifico</option>
              <option value="other">Altro</option>
            </select>

            <label>Data:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) =>
                setFilterDate(e.target.value)
              }
            />
            {filterDate && (
              <Button
                size="small"
                onClick={() => setFilterDate("")}
              >
                ✕ Rimuovi filtro
              </Button>
            )}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className={styles["empty-state"]}>
            <div className={styles.icon}>💳</div>
            <h3>Nessun pagamento</h3>
            <p>
              {filterMethod !== "all" || filterDate
                ? "Nessun pagamento trovato con questi filtri"
                : "Inizia registrando il primo pagamento"}
            </p>
            {filterMethod === "all" && !filterDate && (
              <Button onClick={handleAddPayment}>
                ➕ Registra primo pagamento
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className={styles["payments-grid"]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredPayments.map((payment, index) => {
              const quoteInfo = getQuoteInfo(
                payment.quoteId
              );
              return (
                <motion.div
                  key={payment.id}
                  className={styles["payment-card"]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: -4,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEditPayment(payment)}
                >
                  <div className={styles["payment-header"]}>
                    <div className={styles["payment-info"]}>
                      <div
                        className={
                          styles["payment-patient"]
                        }
                      >
                        {getPatientName(payment.patientId)}
                      </div>
                      <div
                        className={styles["payment-meta"]}
                      >
                        <div
                          className={styles["meta-item"]}
                        >
                          📅{" "}
                          {new Date(
                            payment.date
                          ).toLocaleDateString("it-IT")}
                        </div>
                        {quoteInfo && (
                          <div
                            className={styles["meta-item"]}
                          >
                            💰 Preventivo:{" "}
                            {quoteInfo.patientName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={styles["payment-amount"]}
                    >
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>

                  <div
                    className={styles["payment-details"]}
                  >
                    <div
                      className={`${
                        styles["payment-method"]
                      } ${styles[payment.method]}`}
                    >
                      {getMethodLabel(payment.method)}
                    </div>
                    {payment.notes && (
                      <div
                        className={styles["payment-notes"]}
                      >
                        {payment.notes}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {showModal && (
          <PaymentModal
            payment={editingPayment}
            patients={patients}
            quotes={quotes}
            onClose={handleCloseModal}
            onSave={handleSavePayment}
          />
        )}
      </div>
    </Layout>
  );
};

// Modal per creare/modificare pagamento
interface PaymentModalProps {
  payment: Payment | null;
  patients: Patient[];
  quotes: Quote[];
  onClose: () => void;
  onSave: () => void;
}

const PaymentModal = ({
  payment,
  patients,
  quotes,
  onClose,
  onSave,
}: PaymentModalProps) => {
  const [formData, setFormData] = useState({
    patientId: payment?.patientId || "",
    quoteId: payment?.quoteId || "",
    amount: payment?.amount || 0,
    date:
      payment?.date ||
      new Date().toISOString().split("T")[0],
    method: payment?.method || "cash",
    notes: payment?.notes || "",
  });

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  // Filtra preventivi accettati per il paziente selezionato
  const availableQuotes = quotes.filter(
    (q) =>
      q.status === "accepted" &&
      (!formData.patientId ||
        q.patientId === formData.patientId)
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = "Seleziona un paziente";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount =
        "L'importo deve essere maggiore di 0";
    }

    if (!formData.date) {
      newErrors.date = "La data è obbligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (payment) {
      // Modifica pagamento esistente
      paymentsService.update(payment.id, formData);
    } else {
      // Crea nuovo pagamento
      const newPayment: Payment = {
        id: generateId(),
        ...formData,
        quoteId: formData.quoteId || undefined,
      };
      paymentsService.create(newPayment);
    }

    onSave();
  };

  const handleDelete = () => {
    if (
      payment &&
      window.confirm(
        "Sei sicuro di voler eliminare questo pagamento?"
      )
    ) {
      paymentsService.delete(payment.id);
      onSave();
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, amount: value }));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const handleQuoteSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const quoteId = e.target.value;
    if (quoteId) {
      const quote = quotes.find((q) => q.id === quoteId);
      if (quote) {
        setFormData((prev) => ({
          ...prev,
          quoteId,
          patientId: quote.patientId,
          amount: quote.totalAmount,
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, quoteId: "" }));
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
            {payment
              ? "Modifica Pagamento"
              : "Nuovo Pagamento"}
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
              <label htmlFor="quoteId">
                Preventivo (opzionale)
              </label>
              <select
                id="quoteId"
                name="quoteId"
                value={formData.quoteId}
                onChange={handleQuoteSelect}
              >
                <option value="">Nessun preventivo</option>
                {availableQuotes.map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.patientName} -{" "}
                    {new Intl.NumberFormat("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    }).format(quote.totalAmount)}
                  </option>
                ))}
              </select>
              <div className={styles.hint}>
                Seleziona un preventivo accettato per
                auto-compilare paziente e importo
              </div>
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="patientId">Paziente *</label>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                disabled={!!formData.quoteId}
              >
                <option value="">
                  Seleziona un paziente
                </option>
                {patients.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                  >
                    {patient.name}
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <div className={styles.error}>
                  {errors.patientId}
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className={styles["form-group"]}>
                <label htmlFor="amount">
                  Importo (€) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  min="0"
                  step="0.01"
                />
                {errors.amount && (
                  <div className={styles.error}>
                    {errors.amount}
                  </div>
                )}
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="date">Data *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
                {errors.date && (
                  <div className={styles.error}>
                    {errors.date}
                  </div>
                )}
              </div>
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="method">
                Metodo di pagamento *
              </label>
              <select
                id="method"
                name="method"
                value={formData.method}
                onChange={handleChange}
              >
                <option value="cash">💵 Contanti</option>
                <option value="card">💳 Carta</option>
                <option value="transfer">
                  🏦 Bonifico
                </option>
                <option value="other">📝 Altro</option>
              </select>
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="notes">
                Note (opzionale)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Aggiungi note sul pagamento..."
              />
            </div>
          </div>

          <div className={styles["modal-footer"]}>
            {payment && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                style={{ marginRight: "auto" }}
              >
                🗑️ Elimina
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Annulla
            </Button>
            <Button type="submit">
              {payment
                ? "Salva modifiche"
                : "Registra pagamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
