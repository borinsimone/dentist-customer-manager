import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import {
  appointmentsService,
  patientsService,
  reminderLogsService,
  generateId,
} from '../../services/storage';
import type { Appointment, ReminderChannel, ReminderLog } from '../../types';
import styles from './QuickEditAppointment.module.scss';

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
    notes: appointment.notes || '',
  });
  const [preferredChannel, setPreferredChannel] =
    useState<ReminderChannel>('email');
  const [lastReminder, setLastReminder] = useState<ReminderLog | null>(null);
  const [showWhatsAppNotice, setShowWhatsAppNotice] = useState(false);
  const [patientContact, setPatientContact] = useState({
    email: '',
    phone: '',
  });

  useEffect(() => {
    const patient = patientsService.getById(appointment.patientId);
    setPreferredChannel(patient?.reminderChannel || 'email');
    setPatientContact({
      email: patient?.email || '',
      phone: patient?.phone || '',
    });

    const logs = reminderLogsService
      .query((log) => log.appointmentId === appointment.id)
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    setLastReminder(logs[0] || null);
  }, [appointment.id, appointment.patientId]);

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
        | 'scheduled'
        | 'confirmed'
        | 'cancelled'
        | 'completed',
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = () => {
    if (window.confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
      appointmentsService.delete(appointment.id);
      onSave();
      onClose();
    }
  };

  const statusLabels: Record<string, string> = {
    scheduled: 'Programmato',
    confirmed: 'Confermato',
    completed: 'Completato',
    cancelled: 'Annullato',
  };

  const statusIcons: Record<string, string> = {
    scheduled: '📋',
    confirmed: '✅',
    completed: '🏁',
    cancelled: '❌',
  };

  const getChannelLabel = (channel: ReminderChannel) => {
    const labels: Record<ReminderChannel, string> = {
      email: 'Email',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
    };
    return labels[channel];
  };

  const sendReminder = async (channel: ReminderChannel) => {
    const now = new Date().toISOString();
    const status = channel === 'whatsapp' ? 'pending' : 'sent';

    if (channel === 'whatsapp') {
      const log: ReminderLog = {
        id: generateId(),
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        channel,
        type: 'manual',
        status,
        sentAt: now,
      };
      reminderLogsService.create(log);
      appointmentsService.update(appointment.id, {
        reminderSent: true,
        reminderSentAt: now,
        reminderChannel: channel,
        reminderType: 'manual',
        reminderStatus: status,
      });
      setLastReminder(log);
      setShowWhatsAppNotice(true);
      onSave();
      return;
    }
    try {
      if (channel === 'email' && !patientContact.email) {
        window.alert('Email paziente non disponibile.');
        return;
      }
      if (channel === 'sms' && !patientContact.phone) {
        window.alert('Telefono paziente non disponibile.');
        return;
      }

      const response = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          patientName: appointment.patientName,
          patientEmail: patientContact.email,
          patientPhone: patientContact.phone,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.error || 'Invio fallito.');
      }

      const log: ReminderLog = {
        id: generateId(),
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        channel,
        type: 'manual',
        status,
        sentAt: now,
      };
      reminderLogsService.create(log);
      appointmentsService.update(appointment.id, {
        reminderSent: true,
        reminderSentAt: now,
        reminderChannel: channel,
        reminderType: 'manual',
        reminderStatus: status,
      });
      setLastReminder(log);
      onSave();
    } catch (error) {
      console.error('Reminder send error:', error);
      window.alert('Invio promemoria fallito.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles['quick-edit-modal']}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={styles['modal-content']}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
        >
          <div className={styles['modal-header']}>
            <h3>📝 Modifica Appuntamento</h3>
            <button
              className={styles['close-button']}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles['modal-body']}>
              <div className={styles['appointment-info']}>
                <div className={styles['patient-avatar']}>
                  {appointment.patientName.charAt(0).toUpperCase()}
                </div>
                <div className={styles['info-details']}>
                  <div className={styles['patient-name']}>
                    {appointment.patientName}
                  </div>
                  <div className={styles['date-time']}>
                    <span className={styles.item}>
                      📅{' '}
                      {new Date(appointment.date).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className={styles.item}>🕐 {appointment.time}</span>
                  </div>
                </div>
              </div>

              <div className={styles['form-section']}>
                <h4>Stato Appuntamento</h4>
                <div className={styles['status-buttons']}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <button
                      key={value}
                      type='button'
                      className={`${styles['status-button']} ${styles[value]} ${
                        formData.status === value ? styles.active : ''
                      }`}
                      onClick={() => handleStatusChange(value)}
                    >
                      {statusIcons[value]} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles['form-section']}>
                <h4>Modifica Orario</h4>
                <div className={styles['form-row']}>
                  <div className={styles['form-group']}>
                    <label htmlFor='date'>Data</label>
                    <input
                      type='date'
                      id='date'
                      name='date'
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles['form-group']}>
                    <label htmlFor='time'>Ora</label>
                    <input
                      type='time'
                      id='time'
                      name='time'
                      value={formData.time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className={styles['form-section']}>
                <h4>Note</h4>
                <div className={styles['form-row']}>
                  <div className={styles['form-group']}>
                    <textarea
                      id='notes'
                      name='notes'
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder='Aggiungi note per questo appuntamento...'
                    />
                  </div>
                </div>
              </div>

              <div className={styles['form-section']}>
                <h4>Promemoria</h4>
                <div className={styles['reminder-card']}>
                  <div className={styles['reminder-meta']}>
                    <div className={styles['reminder-channel']}>
                      Canale preferito: {getChannelLabel(preferredChannel)}
                    </div>
                    {lastReminder ? (
                      <div className={styles['reminder-last']}>
                        Ultimo invio: {getChannelLabel(lastReminder.channel)} •{' '}
                        {new Date(lastReminder.sentAt).toLocaleString('it-IT')}{' '}
                        •{' '}
                        {lastReminder.status === 'pending'
                          ? 'In attesa'
                          : 'Inviato'}
                      </div>
                    ) : (
                      <div className={styles['reminder-last']}>
                        Nessun promemoria inviato
                      </div>
                    )}
                  </div>
                  <div className={styles['reminder-actions']}>
                    <Button
                      type='button'
                      size='small'
                      variant='secondary'
                      onClick={() => sendReminder(preferredChannel)}
                    >
                      🚀 Invia promemoria ora
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles['modal-footer']}>
              <div className={styles['left-actions']}>
                <Button
                  type='button'
                  variant='danger'
                  size='small'
                  onClick={handleDelete}
                >
                  🗑️ Elimina
                </Button>
              </div>
              <div className={styles['right-actions']}>
                <Button
                  type='button'
                  variant='secondary'
                  size='small'
                  onClick={onClose}
                >
                  Annulla
                </Button>
                <Button
                  type='submit'
                  size='small'
                >
                  💾 Salva
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {showWhatsAppNotice && (
        <div
          className={styles['whatsapp-overlay']}
          onClick={() => setShowWhatsAppNotice(false)}
        >
          <div
            className={styles['whatsapp-modal']}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>WhatsApp non ancora attivo</h4>
            <p>In attesa di approvazione servizio con API.</p>
            <Button
              type='button'
              size='small'
              onClick={() => setShowWhatsAppNotice(false)}
            >
              Ok
            </Button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
