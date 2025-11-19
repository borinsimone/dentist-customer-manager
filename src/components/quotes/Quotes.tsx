import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "../layout/Layout";
import { Button } from "../common/Button";
import {
  quotesService,
  patientsService,
  treatmentPricesService,
  generateId,
} from "../../services/storage";
import { exportQuoteToPDF } from "../../utils/pdfExport";
import type {
  Quote,
  Patient,
  TreatmentPrice,
  QuoteItem,
} from "../../types";
import styles from "./Quotes.module.scss";

export const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatmentPrices, setTreatmentPrices] = useState<
    TreatmentPrice[]
  >([]);
  const [filterStatus, setFilterStatus] =
    useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] =
    useState<Quote | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setQuotes(quotesService.getAll());
    setPatients(patientsService.getAll());
    setTreatmentPrices(treatmentPricesService.getAll());
  };

  const filteredQuotes = quotes
    .filter(
      (quote) =>
        filterStatus === "all" ||
        quote.status === filterStatus
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleAddQuote = () => {
    setEditingQuote(null);
    setShowModal(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuote(null);
  };

  const handleSaveQuote = () => {
    loadData();
    handleCloseModal();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Bozza",
      sent: "Inviato",
      accepted: "Accettato",
      rejected: "Rifiutato",
    };
    return labels[status] || status;
  };

  return (
    <Layout
      title="Preventivi"
      actions={
        <Button onClick={handleAddQuote}>
          ➕ Nuovo Preventivo
        </Button>
      }
    >
      <div className={styles["quotes-page"]}>
        <div className={styles["page-header"]}>
          <div className={styles.filters}>
            <label>Stato:</label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
            >
              <option value="all">Tutti</option>
              <option value="draft">Bozze</option>
              <option value="sent">Inviati</option>
              <option value="accepted">Accettati</option>
              <option value="rejected">Rifiutati</option>
            </select>
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className={styles["empty-state"]}>
            <div className={styles.icon}>💰</div>
            <h3>
              {filterStatus === "all"
                ? "Nessun preventivo"
                : "Nessun preventivo in questo stato"}
            </h3>
            <p>
              {filterStatus === "all"
                ? "Inizia creando il primo preventivo"
                : "Prova a modificare il filtro"}
            </p>
            {filterStatus === "all" && (
              <Button onClick={handleAddQuote}>
                ➕ Crea primo preventivo
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className={styles["quotes-grid"]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredQuotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                className={styles["quote-card"]}
                onClick={() => handleEditQuote(quote)}
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
              >
                <div className={styles["quote-header"]}>
                  <div className={styles["quote-info"]}>
                    <div
                      className={styles["quote-patient"]}
                    >
                      {quote.patientName}
                    </div>
                    <div className={styles["quote-meta"]}>
                      <div className={styles["meta-item"]}>
                        📅{" "}
                        {new Date(
                          quote.createdAt
                        ).toLocaleDateString("it-IT")}
                      </div>
                      <div className={styles["meta-item"]}>
                        ⏰ Valido fino al{" "}
                        {new Date(
                          quote.validUntil
                        ).toLocaleDateString("it-IT")}
                      </div>
                      <div className={styles["meta-item"]}>
                        📋 {quote.items.length}{" "}
                        {quote.items.length === 1
                          ? "trattamento"
                          : "trattamenti"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${styles["quote-status"]} ${
                      styles[quote.status]
                    }`}
                  >
                    {getStatusLabel(quote.status)}
                  </div>
                </div>

                <div className={styles["quote-items"]}>
                  <div className={styles["items-header"]}>
                    Trattamenti:
                  </div>
                  {quote.items
                    .slice(0, 3)
                    .map((item, index) => (
                      <div
                        key={index}
                        className={styles.item}
                      >
                        <span
                          className={styles["item-name"]}
                        >
                          {item.quantity}x{" "}
                          {item.treatmentName}
                        </span>
                        <span
                          className={styles["item-price"]}
                        >
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  {quote.items.length > 3 && (
                    <div className={styles.item}>
                      <span className={styles["item-name"]}>
                        +{quote.items.length - 3} altri
                        trattamenti
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles["quote-total"]}>
                  <span className={styles["total-label"]}>
                    Totale:
                  </span>
                  <span className={styles["total-amount"]}>
                    {formatCurrency(quote.totalAmount)}
                  </span>
                </div>

                <div className={styles["quote-actions"]}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportQuoteToPDF(
                        quote,
                        "Studio Dentistico Demo"
                      );
                    }}
                  >
                    📄 Esporta PDF
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {showModal && (
          <QuoteModal
            quote={editingQuote}
            patients={patients}
            treatmentPrices={treatmentPrices}
            onClose={handleCloseModal}
            onSave={handleSaveQuote}
          />
        )}
      </div>
    </Layout>
  );
};

// Modal per creare/modificare preventivo
interface QuoteModalProps {
  quote: Quote | null;
  patients: Patient[];
  treatmentPrices: TreatmentPrice[];
  onClose: () => void;
  onSave: () => void;
}

const QuoteModal = ({
  quote,
  patients,
  treatmentPrices,
  onClose,
  onSave,
}: QuoteModalProps) => {
  const [formData, setFormData] = useState({
    patientId: quote?.patientId || "",
    validUntil: quote?.validUntil || getDefaultValidUntil(),
    status: quote?.status || "draft",
  });

  const [items, setItems] = useState<QuoteItem[]>(
    quote?.items || [
      {
        treatmentName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]
  );

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  function getDefaultValidUntil() {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 giorni da oggi
    return date.toISOString().split("T")[0];
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        treatmentName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Ricalcola il totale dell'item
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total =
        newItems[index].quantity *
        newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const handleTreatmentSelect = (
    index: number,
    treatmentId: string
  ) => {
    const treatment = treatmentPrices.find(
      (t) => t.id === treatmentId
    );
    if (treatment) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        treatmentName: treatment.name,
        description: treatment.description,
        unitPrice: treatment.defaultPrice,
        total:
          newItems[index].quantity * treatment.defaultPrice,
      };
      setItems(newItems);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = "Seleziona un paziente";
    }

    if (!formData.validUntil) {
      newErrors.validUntil =
        "La data di validità è obbligatoria";
    }

    if (items.length === 0) {
      newErrors.items = "Aggiungi almeno un trattamento";
    }

    // Verifica che tutti gli item abbiano nome e prezzo
    const hasInvalidItems = items.some(
      (item) =>
        !item.treatmentName.trim() ||
        item.unitPrice < 0 ||
        item.quantity < 1
    );

    if (hasInvalidItems) {
      newErrors.items =
        "Completa tutti i trattamenti con nome, quantità e prezzo validi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedPatient = patients.find(
      (p) => p.id === formData.patientId
    );
    if (!selectedPatient) return;

    const totalAmount = calculateTotal();
    const now = new Date().toISOString();

    if (quote) {
      // Modifica preventivo esistente
      quotesService.update(quote.id, {
        ...formData,
        items,
        totalAmount,
        patientName: selectedPatient.name,
      });
    } else {
      // Crea nuovo preventivo
      const newQuote: Quote = {
        id: generateId(),
        ...formData,
        patientName: selectedPatient.name,
        items,
        totalAmount,
        createdAt: now,
      };
      quotesService.create(newQuote);
    }

    onSave();
  };

  const handleDelete = () => {
    if (
      quote &&
      window.confirm(
        "Sei sicuro di voler eliminare questo preventivo?"
      )
    ) {
      quotesService.delete(quote.id);
      onSave();
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            {quote
              ? "Modifica Preventivo"
              : "Nuovo Preventivo"}
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className={styles["form-group"]}>
                <label htmlFor="patientId">
                  Paziente *
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
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

              <div className={styles["form-group"]}>
                <label htmlFor="status">Stato</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Bozza</option>
                  <option value="sent">Inviato</option>
                  <option value="accepted">
                    Accettato
                  </option>
                  <option value="rejected">
                    Rifiutato
                  </option>
                </select>
              </div>
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="validUntil">
                Valido fino al *
              </label>
              <input
                type="date"
                id="validUntil"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
              />
              {errors.validUntil && (
                <div className={styles.error}>
                  {errors.validUntil}
                </div>
              )}
            </div>

            <div className={styles["items-builder"]}>
              <div className={styles["items-header"]}>
                <h4>Trattamenti</h4>
                <Button
                  type="button"
                  size="small"
                  onClick={handleAddItem}
                >
                  ➕ Aggiungi Trattamento
                </Button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className={styles["item-row"]}
                >
                  <div className={styles["form-group"]}>
                    <label>Trattamento</label>
                    <select
                      value=""
                      onChange={(e) =>
                        handleTreatmentSelect(
                          index,
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Seleziona o scrivi sotto
                      </option>
                      {treatmentPrices.map((treatment) => (
                        <option
                          key={treatment.id}
                          value={treatment.id}
                        >
                          {treatment.name} -{" "}
                          {treatment.defaultPrice}€
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={item.treatmentName}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "treatmentName",
                          e.target.value
                        )
                      }
                      placeholder="Nome trattamento"
                      style={{ marginTop: "0.5rem" }}
                    />
                  </div>

                  <div className={styles["form-group"]}>
                    <label>Quantità</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>

                  <div className={styles["form-group"]}>
                    <label>Prezzo Unitario (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="danger"
                    size="small"
                    onClick={() => handleRemoveItem(index)}
                    className={styles["remove-button"]}
                    disabled={items.length === 1}
                  >
                    🗑️
                  </Button>
                </div>
              ))}

              {errors.items && (
                <div className={styles.error}>
                  {errors.items}
                </div>
              )}

              <div className={styles["total-row"]}>
                <span className={styles["total-label"]}>
                  Totale Preventivo:
                </span>
                <span className={styles["total-amount"]}>
                  {new Intl.NumberFormat("it-IT", {
                    style: "currency",
                    currency: "EUR",
                  }).format(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          <div className={styles["modal-footer"]}>
            {quote && (
              <>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  style={{ marginRight: "auto" }}
                >
                  🗑️ Elimina
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    exportQuoteToPDF(
                      quote,
                      "Studio Dentistico Demo"
                    )
                  }
                >
                  📄 Esporta PDF
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Annulla
            </Button>
            <Button type="submit">
              {quote
                ? "Salva modifiche"
                : "Crea preventivo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
