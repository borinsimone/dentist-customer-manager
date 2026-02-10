import { useState, useEffect } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../common/Button';
import {
  treatmentPricesService,
  patientsService,
  appointmentsService,
  quotesService,
  paymentsService,
  generateId,
  backupData,
  reminderSettingsService,
} from '../../services/storage';
import type { TreatmentPrice, ReminderSettings } from '../../types';
import styles from './Settings.module.scss';

export const Settings = () => {
  const [treatmentPrices, setTreatmentPrices] = useState<TreatmentPrice[]>([]);
  const [isPriceListOpen, setIsPriceListOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<TreatmentPrice | null>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(
    reminderSettingsService.get(),
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTreatmentPrices(treatmentPricesService.getAll());
    setReminderSettings(reminderSettingsService.get());
  };

  const handleAddPrice = () => {
    setEditingPrice(null);
    setShowModal(true);
  };

  const handleEditPrice = (price: TreatmentPrice) => {
    setEditingPrice(price);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPrice(null);
  };

  const handleSave = () => {
    loadData();
    handleCloseModal();
  };

  const handleReminderSettingChange = (updates: Partial<ReminderSettings>) => {
    const updated = reminderSettingsService.update(updates);
    setReminderSettings(updated);
  };

  const handleTogglePriceList = () => {
    setIsPriceListOpen((prev) => !prev);
  };

  const handleBackup = () => {
    const data = backupData();
    const blob = new Blob([data], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-dentist-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const reminderAutoOptions = [
    {
      value: true,
      label: 'Attivo',
      description: 'Invio automatico abilitato',
    },
    {
      value: false,
      label: 'Disattivo',
      description: 'Solo invio manuale',
    },
  ];

  // Statistiche sistema
  const stats = {
    patients: patientsService.getAll().length,
    appointments: appointmentsService.getAll().length,
    quotes: quotesService.getAll().length,
    payments: paymentsService.getAll().length,
    treatmentPrices: treatmentPrices.length,
  };

  return (
    <Layout title='Impostazioni'>
      <div className={styles['settings-page']}>
        <div className={styles['settings-sections']}>
          {/* Informazioni Sistema */}
          <div className={styles.section}>
            <div className={styles['section-header']}>
              <h2>📊 Informazioni Sistema</h2>
              <Button
                size='small'
                onClick={handleBackup}
              >
                💾 Backup Dati
              </Button>
            </div>
            <div className={styles['section-body']}>
              <div className={styles['info-grid']}>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>Pazienti totali</span>
                  <span className={styles['info-value']}>{stats.patients}</span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>
                    Appuntamenti totali
                  </span>
                  <span className={styles['info-value']}>
                    {stats.appointments}
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>
                    Preventivi totali
                  </span>
                  <span className={styles['info-value']}>{stats.quotes}</span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>
                    Pagamenti registrati
                  </span>
                  <span className={styles['info-value']}>{stats.payments}</span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>
                    Storage utilizzato
                  </span>
                  <span className={styles['info-value']}>localStorage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Listino Prezzi */}
          <div className={styles.section}>
            <div className={styles['section-header']}>
              <div className={styles['section-title']}>
                <h2>💰 Listino Prezzi Trattamenti</h2>
                <span className={styles['section-subtitle']}>
                  {treatmentPrices.length} trattamenti
                </span>
              </div>
              <div className={styles['section-actions']}>
                <Button
                  size='small'
                  variant='secondary'
                  onClick={handleTogglePriceList}
                  aria-expanded={isPriceListOpen}
                  aria-controls='price-list-section'
                >
                  {isPriceListOpen ? '🔽 Nascondi' : '▶️ Mostra'}
                </Button>
                <Button onClick={handleAddPrice}>➕ Nuovo Prezzo</Button>
              </div>
            </div>
            <div
              id='price-list-section'
              aria-hidden={!isPriceListOpen}
              className={`${styles['section-body']} ${
                !isPriceListOpen ? styles['section-body-collapsed'] : ''
              }`}
            >
              {treatmentPrices.length === 0 ? (
                <div className={styles['empty-state']}>
                  <div className={styles.icon}>💰</div>
                  <p>Nessun prezzo configurato</p>
                  <Button onClick={handleAddPrice}>
                    ➕ Aggiungi primo prezzo
                  </Button>
                </div>
              ) : (
                <div className={styles['treatment-prices-list']}>
                  {treatmentPrices.map((price) => (
                    <div
                      key={price.id}
                      className={styles['treatment-price-item']}
                    >
                      <div className={styles['treatment-name']}>
                        {price.name}
                      </div>
                      <div className={styles['treatment-description']}>
                        {price.description}
                      </div>
                      <div className={styles['treatment-price']}>
                        {formatCurrency(price.defaultPrice)}
                      </div>
                      <div className={styles['treatment-actions']}>
                        <Button
                          size='small'
                          variant='secondary'
                          onClick={() => handleEditPrice(price)}
                        >
                          ✏️
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Promemoria */}
          <div className={styles.section}>
            <div className={styles['section-header']}>
              <div className={styles['section-title']}>
                <h2>🔔 Promemoria Appuntamenti</h2>
                <span className={styles['section-subtitle']}>
                  Invio automatico e forzato
                </span>
              </div>
            </div>
            <div className={styles['section-body']}>
              <div className={`${styles['form-row']} ${styles['two-columns']}`}>
                <div className={styles['form-group']}>
                  <label>Invio automatico</label>
                  <div className={styles['option-list']}>
                    {reminderAutoOptions.map((option) => (
                      <button
                        key={option.label}
                        type='button'
                        className={`${styles['option-item']} ${
                          reminderSettings.autoSendEnabled === option.value
                            ? styles.active
                            : ''
                        }`}
                        onClick={() =>
                          handleReminderSettingChange({
                            autoSendEnabled: option.value,
                          })
                        }
                      >
                        <div className={styles['option-info']}>
                          <div className={styles['option-title']}>
                            {option.label}
                          </div>
                          <div className={styles['option-description']}>
                            {option.description}
                          </div>
                        </div>
                        <div className={styles['option-action']}>
                          {reminderSettings.autoSendEnabled === option.value
                            ? 'Selezionato'
                            : 'Seleziona'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles['form-group']}>
                  <label htmlFor='reminderHours'>Preavviso (ore)</label>
                  <input
                    type='number'
                    id='reminderHours'
                    min={1}
                    max={168}
                    value={reminderSettings.hoursBefore}
                    onChange={(e) =>
                      handleReminderSettingChange({
                        hoursBefore: Math.max(
                          1,
                          Math.min(168, Number(e.target.value) || 1),
                        ),
                      })
                    }
                  />
                </div>
              </div>
              <div className={styles['reminder-hint']}>
                I promemoria automatici usano il canale preferito del paziente
                (Email/SMS/WhatsApp).
              </div>
            </div>
          </div>

          {/* Informazioni App */}
          <div className={styles.section}>
            <div className={styles['section-header']}>
              <h2>ℹ️ Informazioni Applicazione</h2>
            </div>
            <div className={styles['section-body']}>
              <div className={styles['info-grid']}>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>Versione</span>
                  <span className={styles['info-value']}>1.0.0</span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>Tipo storage</span>
                  <span className={styles['info-value']}>
                    localStorage (Demo)
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>Framework</span>
                  <span className={styles['info-value']}>
                    React 19 + TypeScript
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>Stato</span>
                  <span className={styles['info-value']}>✅ Operativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <TreatmentPriceModal
            price={editingPrice}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
        )}
      </div>
    </Layout>
  );
};

// Modal per creare/modificare prezzo trattamento
interface TreatmentPriceModalProps {
  price: TreatmentPrice | null;
  onClose: () => void;
  onSave: () => void;
}

const TreatmentPriceModal = ({
  price,
  onClose,
  onSave,
}: TreatmentPriceModalProps) => {
  const categoryOptions = [
    { value: 'generale', label: 'Generale' },
    { value: 'igiene', label: 'Igiene' },
    { value: 'conservativa', label: 'Conservativa' },
    { value: 'endodonzia', label: 'Endodonzia' },
    { value: 'protesi', label: 'Protesi' },
    { value: 'chirurgia', label: 'Chirurgia' },
    { value: 'ortodonzia', label: 'Ortodonzia' },
    { value: 'altro', label: 'Altro' },
  ];
  const [formData, setFormData] = useState({
    name: price?.name || '',
    description: price?.description || '',
    category: price?.category || 'generale',
    defaultPrice: price?.defaultPrice || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }

    if (!formData.defaultPrice || formData.defaultPrice <= 0) {
      newErrors.defaultPrice = 'Il prezzo deve essere maggiore di 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (price) {
      // Modifica prezzo esistente
      treatmentPricesService.update(price.id, formData);
    } else {
      // Crea nuovo prezzo
      const newPrice: TreatmentPrice = {
        id: generateId(),
        ...formData,
      };
      treatmentPricesService.create(newPrice);
    }

    onSave();
  };

  const handleDelete = () => {
    if (
      price &&
      window.confirm('Sei sicuro di voler eliminare questo prezzo?')
    ) {
      treatmentPricesService.delete(price.id);
      onSave();
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      defaultPrice: value,
    }));
    if (errors.defaultPrice) {
      setErrors((prev) => ({ ...prev, defaultPrice: '' }));
    }
  };

  return (
    <div
      className={styles['modal-overlay']}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['modal-header']}>
          <h2>{price ? 'Modifica Prezzo' : 'Nuovo Prezzo'}</h2>
          <button
            className={styles['close-button']}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles['modal-body']}>
            <div className={styles['form-group']}>
              <label htmlFor='name'>Nome Trattamento *</label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                placeholder='es. Pulizia dentale'
              />
              {errors.name && <div className={styles.error}>{errors.name}</div>}
            </div>

            <div className={styles['form-group']}>
              <label htmlFor='description'>Descrizione</label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleChange}
                placeholder='Descrizione del trattamento...'
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div className={styles['form-group']}>
                <label htmlFor='category'>Categoria</label>
                <div className={styles['option-list']}>
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type='button'
                      className={`${styles['option-item']} ${
                        formData.category === option.value ? styles.active : ''
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          category: option.value,
                        }))
                      }
                    >
                      <div className={styles['option-info']}>
                        <div className={styles['option-title']}>
                          {option.label}
                        </div>
                      </div>
                      <div className={styles['option-action']}>
                        {formData.category === option.value
                          ? 'Selezionato'
                          : 'Seleziona'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles['form-group']}>
                <label htmlFor='defaultPrice'>Prezzo (€) *</label>
                <input
                  type='number'
                  id='defaultPrice'
                  name='defaultPrice'
                  value={formData.defaultPrice}
                  onChange={handlePriceChange}
                  min='0'
                  step='0.01'
                />
                {errors.defaultPrice && (
                  <div className={styles.error}>{errors.defaultPrice}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles['modal-footer']}>
            {price && (
              <Button
                type='button'
                variant='danger'
                onClick={handleDelete}
                style={{ marginRight: 'auto' }}
              >
                🗑️ Elimina
              </Button>
            )}
            <Button
              type='button'
              variant='secondary'
              onClick={onClose}
            >
              Annulla
            </Button>
            <Button type='submit'>
              {price ? 'Salva modifiche' : 'Crea prezzo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
