import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../layout/Layout';
import { Card, CardHeader, CardBody } from '../common/Card';
import { QuickEditAppointment } from './QuickEditAppointment';
import {
  appointmentsService,
  patientsService,
  paymentsService,
  quotesService,
} from '../../services/storage';
import type { DashboardStats, Appointment } from '../../types';
import styles from './Dashboard.module.scss';

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: [],
    upcomingAppointments: [],
    patientsWithPendingPayments: [],
    totalPatients: 0,
    todayRevenue: 0,
  });

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const today = new Date().toISOString().split('T')[0];
    const allAppointments = appointmentsService.getAll();
    const allPatients = patientsService.getAll();
    const allPayments = paymentsService.getAll();
    const allQuotes = quotesService.getAll();

    // Appuntamenti di oggi
    const todayAppointments = allAppointments.filter(
      (apt) => apt.date === today && apt.status !== 'cancelled'
    );

    // Prossimi appuntamenti (prossimi 7 giorni)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingAppointments = allAppointments
      .filter(
        (apt) =>
          apt.date > today &&
          apt.date <= nextWeek.toISOString().split('T')[0] &&
          apt.status !== 'cancelled'
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

    // Pagamenti in sospeso
    const patientsWithPending = allPatients
      .map((patient) => {
        const patientQuotes = allQuotes.filter(
          (q) => q.patientId === patient.id && q.status === 'accepted'
        );
        const totalDue = patientQuotes.reduce(
          (sum, q) => sum + q.totalAmount,
          0
        );

        const patientPayments = allPayments.filter(
          (p) => p.patientId === patient.id
        );
        const totalPaid = patientPayments.reduce((sum, p) => sum + p.amount, 0);

        const pending = totalDue - totalPaid;

        return {
          patient,
          pendingAmount: pending,
        };
      })
      .filter((p) => p.pendingAmount > 0)
      .sort((a, b) => b.pendingAmount - a.pendingAmount)
      .slice(0, 5);

    // Incassi di oggi
    const todayPayments = allPayments.filter((p) => p.date === today);
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    setStats({
      todayAppointments,
      upcomingAppointments,
      patientsWithPendingPayments: patientsWithPending,
      totalPatients: allPatients.length,
      todayRevenue,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
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
    <Layout title='Dashboard'>
      <div className={styles.dashboard}>
        <motion.div
          className={styles['stats-grid']}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`${styles['stat-card']}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div className={styles.icon}>👥</div>
            <div className={styles.value}>{stats.totalPatients}</div>
            <div className={styles.label}>Pazienti totali</div>
          </motion.div>

          <motion.div
            className={`${styles['stat-card']} ${styles.success}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div className={styles.icon}>📅</div>
            <div className={styles.value}>{stats.todayAppointments.length}</div>
            <div className={styles.label}>Appuntamenti oggi</div>
          </motion.div>

          <motion.div
            className={`${styles['stat-card']} ${styles.warning}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <div className={styles.icon}>⏰</div>
            <div className={styles.value}>
              {stats.upcomingAppointments.length}
            </div>
            <div className={styles.label}>Prossimi appuntamenti</div>
          </motion.div>
          {/* 
          <motion.div
            className={`${styles["stat-card"]} ${styles.info}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <div className={styles.icon}>💰</div>
            <div className={styles.value}>
              {formatCurrency(stats.todayRevenue)}
            </div>
            <div className={styles.label}>Incasso oggi</div>
          </motion.div> */}
        </motion.div>

        <motion.div
          className={styles['card-container']}
          // className={styles["grid-2"]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h2>📅 Appuntamenti di oggi</h2>
            </CardHeader>
            <CardBody>
              {stats.todayAppointments.length === 0 ? (
                <div className={styles['empty-state']}>
                  <div className={styles.icon}>📭</div>
                  <p>Nessun appuntamento oggi</p>
                </div>
              ) : (
                <div className={styles['appointments-list']}>
                  {stats.todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={styles['appointment-item']}
                      onClick={() => setSelectedAppointment(appointment)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles['appointment-time']}>
                        {appointment.time}
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
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2>⏰ Prossimi appuntamenti</h2>
            </CardHeader>
            <CardBody>
              {stats.upcomingAppointments.length === 0 ? (
                <div className={styles['empty-state']}>
                  <div className={styles.icon}>📭</div>
                  <p>Nessun appuntamento in programma</p>
                </div>
              ) : (
                <div className={styles['appointments-list']}>
                  {stats.upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={styles['appointment-item']}
                      onClick={() => setSelectedAppointment(appointment)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles['appointment-time']}>
                        {new Date(appointment.date).toLocaleDateString(
                          'it-IT',
                          {
                            day: '2-digit',
                            month: '2-digit',
                          }
                        )}
                        -{appointment.time}
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
              )}
            </CardBody>
          </Card>

          {stats.patientsWithPendingPayments.length > 0 && (
            <Card>
              <CardHeader>
                <h2>💳 Pazienti con pagamenti in sospeso</h2>
              </CardHeader>
              <CardBody>
                <div className={styles['appointments-list']}>
                  {stats.patientsWithPendingPayments.map(
                    ({ patient, pendingAmount }) => (
                      <div
                        key={patient.id}
                        className={styles['appointment-item']}
                      >
                        <div className={styles['appointment-details']}>
                          <div className={styles['patient-name']}>
                            {patient.name}
                          </div>
                          <div className={styles['appointment-notes']}>
                            {patient.phone} • {patient.email}
                          </div>
                        </div>
                        <div
                          className={`${styles['appointment-status']} ${styles.warning}`}
                        >
                          {formatCurrency(pendingAmount)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </motion.div>

        {selectedAppointment && (
          <QuickEditAppointment
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onSave={() => {
              loadDashboardData();
              setSelectedAppointment(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};
