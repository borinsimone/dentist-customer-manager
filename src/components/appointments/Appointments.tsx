import { useState, useEffect } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../common/Button';
import { QuickEditAppointment } from '../dashboard/QuickEditAppointment';
import {
  appointmentsService,
  patientsService,
  generateId,
} from '../../services/storage';
import type { Appointment, Patient } from '../../types';
import styles from './Appointments.module.scss';

type ViewMode = 'calendar' | 'list';

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [quickViewAppointment, setQuickViewAppointment] =
    useState<Appointment | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAppointments(appointmentsService.getAll());
    setPatients(patientsService.getAll());
  };

  const filteredAppointments = appointments
    .filter((apt) => filterStatus === 'all' || apt.status === filterStatus)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setPreselectedDate(null);
    setShowModal(true);
  };

  const handleAddAppointmentForDate = (date: string) => {
    setEditingAppointment(null);
    setPreselectedDate(date);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setPreselectedDate(null);
  };

  const handleSaveAppointment = () => {
    loadData();
    handleCloseModal();
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Programmato',
      confirmed: 'Confermato',
      completed: 'Completato',
      cancelled: 'Annullato',
    };
    return labels[status] || status;
  };

  return (
    <Layout
      title='Appuntamenti'
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
            size='small'
          >
            📋 Lista
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('calendar')}
            size='small'
          >
            📅 Calendario
          </Button>
          <Button onClick={handleAddAppointment}>➕ Nuovo Appuntamento</Button>
        </div>
      }
    >
      <div className={styles['appointments-page']}>
        <div className={styles['page-header']}>
          <div className={styles.filters}>
            <label>Stato:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value='all'>Tutti</option>
              <option value='scheduled'>Programmati</option>
              <option value='confirmed'>Confermati</option>
              <option value='completed'>Completati</option>
              <option value='cancelled'>Annullati</option>
            </select>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.scheduled}`}></span>
              <span>Programmati</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.confirmed}`}></span>
              <span>Confermati</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.completed}`}></span>
              <span>Completati</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.cancelled}`}></span>
              <span>Annullati</span>
            </div>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <CalendarView
            appointments={filteredAppointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onQuickView={setQuickViewAppointment}
            onCreateAppointment={handleAddAppointmentForDate}
          />
        ) : (
          <ListView
            appointments={filteredAppointments}
            onQuickView={setQuickViewAppointment}
            getStatusLabel={getStatusLabel}
          />
        )}

        {showModal && (
          <AppointmentModal
            appointment={editingAppointment}
            patients={patients}
            onClose={handleCloseModal}
            onSave={handleSaveAppointment}
            initialDate={preselectedDate || undefined}
          />
        )}

        {quickViewAppointment && (
          <QuickEditAppointment
            appointment={quickViewAppointment}
            onClose={() => setQuickViewAppointment(null)}
            onSave={() => {
              loadData();
              setQuickViewAppointment(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

// Vista Lista
interface ListViewProps {
  appointments: Appointment[];
  onQuickView: (appointment: Appointment) => void;
  getStatusLabel: (status: string) => string;
}

const ListView = ({
  appointments,
  onQuickView,
  getStatusLabel,
}: ListViewProps) => {
  if (appointments.length === 0) {
    return (
      <div className={styles['empty-state']}>
        <div className={styles.icon}>📅</div>
        <h3>Nessun appuntamento</h3>
        <p>Inizia creando il primo appuntamento</p>
      </div>
    );
  }

  return (
    <div className={styles['list-view']}>
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className={styles['appointment-card']}
          onClick={() => onQuickView(appointment)}
        >
          <div className={styles['appointment-time']}>
            <div className={styles.date}>
              {new Date(appointment.date).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className={styles.time}>{appointment.time}</div>
          </div>

          <div className={styles['appointment-details']}>
            <div className={styles['patient-name']}>
              {appointment.patientName}
            </div>
            {appointment.notes && (
              <div className={styles['appointment-notes']}>
                {appointment.notes}
              </div>
            )}
          </div>

          <div
            className={`${styles['appointment-status']} ${
              styles[appointment.status]
            }`}
          >
            {getStatusLabel(appointment.status)}
          </div>
        </div>
      ))}
    </div>
  );
};

// Vista Calendario
interface CalendarViewProps {
  appointments: Appointment[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onQuickView: (appointment: Appointment) => void;
  onCreateAppointment: (date: string) => void;
}

const CalendarView = ({
  appointments,
  currentDate,
  onDateChange,
  onQuickView,
  onCreateAppointment,
}: CalendarViewProps) => {
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();

  const previousMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const today = new Date().toISOString().split('T')[0];

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter((apt) => apt.date === date);
  };

  const days = [];

  // Giorni del mese precedente
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: dateStr === today,
    });
  }

  // Giorni del mese corrente
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      day,
      isCurrentMonth: true,
      isToday: dateStr === today,
    });
  }

  // Giorni del mese successivo
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      day,
      isCurrentMonth: false,
      isToday: dateStr === today,
    });
  }

  return (
    <div className={styles['calendar-view']}>
      <div className={styles['calendar-header']}>
        <div className={styles['current-date']}>
          {currentDate.toLocaleDateString('it-IT', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className={styles['calendar-nav']}>
          <Button
            size='small'
            variant='secondary'
            onClick={previousMonth}
          >
            ◀
          </Button>
          <Button
            size='small'
            variant='secondary'
            onClick={() => onDateChange(new Date())}
          >
            Oggi
          </Button>
          <Button
            size='small'
            variant='secondary'
            onClick={nextMonth}
          >
            ▶
          </Button>
        </div>
      </div>

      <div className={styles['week-days']}>
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
          <div
            key={day}
            className={styles['day-header']}
          >
            {day}
          </div>
        ))}
      </div>

      <div className={styles['calendar-grid']}>
        {days.map((dayInfo, index) => {
          const dayAppointments = getAppointmentsForDate(dayInfo.date);
          return (
            <div
              key={index}
              className={`${styles['calendar-day']} ${
                !dayInfo.isCurrentMonth ? styles['other-month'] : ''
              } ${dayInfo.isToday ? styles.today : ''} ${
                dayAppointments.length > 0 ? styles['has-appointments'] : ''
              }`}
              onDoubleClick={() => {
                setSelectedDate(dayInfo.date);
                setShowDayModal(true);
              }}
              onClick={() => {
                // Su mobile (o click singolo) apriamo il modale
                setSelectedDate(dayInfo.date);
                setShowDayModal(true);
              }}
              style={{ cursor: 'pointer' }}
              title='Clicca per vedere gli appuntamenti'
            >
              <div className={styles['day-number']}>{dayInfo.day}</div>
              {dayAppointments.length > 0 && (
                <div className={styles['day-appointments']}>
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      className={`${styles['mini-appointment']} ${
                        styles[apt.status]
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(apt);
                      }}
                      title={`${apt.time} - ${apt.patientName}`}
                    >
                      {apt.time} {apt.patientName}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className={styles['appointments-count']}>
                      +{dayAppointments.length - 2} altri
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showDayModal && selectedDate && (
        <DayAppointmentsModal
          date={selectedDate}
          appointments={getAppointmentsForDate(selectedDate)}
          onClose={() => {
            setShowDayModal(false);
            setSelectedDate(null);
          }}
          onViewAppointment={onQuickView}
          onCreateAppointment={() => {
            setShowDayModal(false);
            onCreateAppointment(selectedDate);
          }}
        />
      )}
    </div>
  );
};

// Modale per visualizzare tutti gli appuntamenti di una giornata
interface DayAppointmentsModalProps {
  date: string;
  appointments: Appointment[];
  onClose: () => void;
  onViewAppointment: (appointment: Appointment) => void;
  onCreateAppointment: () => void;
}

const DayAppointmentsModal = ({
  date,
  appointments,
  onClose,
  onViewAppointment,
  onCreateAppointment,
}: DayAppointmentsModalProps) => {
  const formattedDate = new Date(date).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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
          <h2>Appuntamenti del {formattedDate}</h2>
          <button
            className={styles['close-button']}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles['modal-body']}>
          {appointments.length === 0 ? (
            <div className={styles['empty-day']}>
              <p>Nessun appuntamento in questa giornata</p>
              <Button onClick={onCreateAppointment}>
                ➕ Crea nuovo appuntamento
              </Button>
            </div>
          ) : (
            <>
              <div className={styles['day-appointments-list']}>
                {appointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className={styles['day-appointment-item']}
                      onClick={() => {
                        onClose();
                        onViewAppointment(apt);
                      }}
                    >
                      <div className={styles['appointment-time-badge']}>
                        {apt.time}
                      </div>
                      <div className={styles['appointment-info']}>
                        <div className={styles['patient-name']}>
                          {apt.patientName}
                        </div>
                        {apt.notes && (
                          <div className={styles['appointment-notes']}>
                            {apt.notes}
                          </div>
                        )}
                      </div>
                      <div
                        className={`${styles['status-badge']} ${
                          styles[apt.status]
                        }`}
                      >
                        {apt.status === 'scheduled' && '📅'}
                        {apt.status === 'confirmed' && '✅'}
                        {apt.status === 'completed' && '✔️'}
                        {apt.status === 'cancelled' && '❌'}
                      </div>
                    </div>
                  ))}
              </div>
              <div className={styles['modal-footer']}>
                <Button onClick={onCreateAppointment}>
                  ➕ Nuovo appuntamento
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal per aggiungere/modificare appuntamento
interface AppointmentModalProps {
  appointment: Appointment | null;
  patients: Patient[];
  onClose: () => void;
  onSave: () => void;
  initialDate?: string;
}

const AppointmentModal = ({
  appointment,
  patients,
  onClose,
  onSave,
  initialDate,
}: AppointmentModalProps) => {
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    date:
      appointment?.date ||
      initialDate ||
      new Date().toISOString().split('T')[0],
    time: appointment?.time || '09:00',
    duration: appointment?.duration || 60,
    status: appointment?.status || 'scheduled',
    notes: appointment?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Seleziona un paziente';
    }

    if (!formData.date) {
      newErrors.date = 'La data è obbligatoria';
    }

    if (!formData.time) {
      newErrors.time = "L'ora è obbligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedPatient = patients.find((p) => p.id === formData.patientId);
    if (!selectedPatient) return;

    if (appointment) {
      // Modifica appuntamento esistente
      appointmentsService.update(appointment.id, {
        ...formData,
        patientName: selectedPatient.name,
      });
    } else {
      // Crea nuovo appuntamento
      const newAppointment: Appointment = {
        id: generateId(),
        ...formData,
        patientName: selectedPatient.name,
        reminderSent: false,
      };
      appointmentsService.create(newAppointment);
    }

    onSave();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
          <h2>
            {appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </h2>
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
              <label htmlFor='patientId'>Paziente *</label>
              <select
                id='patientId'
                name='patientId'
                value={formData.patientId}
                onChange={handleChange}
              >
                <option value=''>Seleziona un paziente</option>
                {patients.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                  >
                    {patient.name} - {patient.phone}
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <div className={styles.error}>{errors.patientId}</div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div className={styles['form-group']}>
                <label htmlFor='date'>Data *</label>
                <input
                  type='date'
                  id='date'
                  name='date'
                  value={formData.date}
                  onChange={handleChange}
                />
                {errors.date && (
                  <div className={styles.error}>{errors.date}</div>
                )}
              </div>

              <div className={styles['form-group']}>
                <label htmlFor='time'>Ora *</label>
                <input
                  type='time'
                  id='time'
                  name='time'
                  value={formData.time}
                  onChange={handleChange}
                />
                {errors.time && (
                  <div className={styles.error}>{errors.time}</div>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div className={styles['form-group']}>
                <label htmlFor='duration'>Durata (minuti)</label>
                <input
                  type='number'
                  id='duration'
                  name='duration'
                  value={formData.duration}
                  onChange={handleChange}
                  min='15'
                  step='15'
                />
              </div>

              <div className={styles['form-group']}>
                <label htmlFor='status'>Stato</label>
                <select
                  id='status'
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value='scheduled'>Programmato</option>
                  <option value='confirmed'>Confermato</option>
                  <option value='completed'>Completato</option>
                  <option value='cancelled'>Annullato</option>
                </select>
              </div>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor='notes'>Note</label>
              <textarea
                id='notes'
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                placeholder='Motivo della visita, note particolari...'
              />
            </div>
          </div>

          <div className={styles['modal-footer']}>
            <Button
              type='button'
              variant='secondary'
              onClick={onClose}
            >
              Annulla
            </Button>
            <Button type='submit'>
              {appointment ? 'Salva modifiche' : 'Crea appuntamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
