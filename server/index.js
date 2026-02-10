import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import twilio from 'twilio';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5174;
const clinicName = process.env.CLINIC_NAME || 'Studio Dentistico';
const clinicPhone = process.env.CLINIC_PHONE || '';
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const buildEmailContent = ({
  patientName,
  appointmentDate,
  appointmentTime,
}) => {
  const subject = `Promemoria appuntamento ${appointmentDate} alle ${appointmentTime}`;
  const bodyText = `Ciao ${patientName},\n\nTi ricordiamo il tuo appuntamento presso ${clinicName} il ${appointmentDate} alle ${appointmentTime}.\nSe devi spostare l'appuntamento, contattaci${clinicPhone ? ` al ${clinicPhone}` : ''}.\n\nA presto!`;
  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Ciao <strong>${patientName}</strong>,</p>
      <p>
        Ti ricordiamo il tuo appuntamento presso <strong>${clinicName}</strong>
        il <strong>${appointmentDate}</strong> alle <strong>${appointmentTime}</strong>.
      </p>
      <p>
        Se devi spostare l'appuntamento, contattaci${
          clinicPhone ? ` al <strong>${clinicPhone}</strong>` : ''
        }.
      </p>
      <p>A presto!</p>
    </div>
  `;

  return { subject, bodyText, bodyHtml };
};

const buildSmsContent = ({ patientName, appointmentDate, appointmentTime }) => {
  return `Promemoria: ${patientName}, appuntamento ${appointmentDate} alle ${appointmentTime} presso ${clinicName}.`;
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/reminders/send', async (req, res) => {
  const {
    channel,
    patientName,
    patientEmail,
    patientPhone,
    appointmentDate,
    appointmentTime,
  } = req.body || {};

  if (!channel || !patientName || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (channel === 'email') {
    if (!resend) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured.' });
    }
    if (!process.env.REMINDER_EMAIL_FROM) {
      return res
        .status(500)
        .json({ error: 'REMINDER_EMAIL_FROM not configured.' });
    }
    if (!patientEmail) {
      return res.status(400).json({ error: 'Missing patientEmail.' });
    }

    const { subject, bodyText, bodyHtml } = buildEmailContent({
      patientName,
      appointmentDate,
      appointmentTime,
    });

    try {
      const result = await resend.emails.send({
        from: process.env.REMINDER_EMAIL_FROM,
        to: patientEmail,
        subject,
        text: bodyText,
        html: bodyHtml,
        replyTo: process.env.REMINDER_REPLY_TO || undefined,
      });

      return res.json({ status: 'sent', providerId: result?.data?.id });
    } catch (error) {
      console.error('Email send error:', error);
      return res.status(500).json({ error: 'Email send failed.' });
    }
  }

  if (channel === 'sms') {
    if (!twilioClient) {
      return res
        .status(500)
        .json({ error: 'TWILIO credentials not configured.' });
    }
    if (!process.env.TWILIO_FROM_NUMBER) {
      return res
        .status(500)
        .json({ error: 'TWILIO_FROM_NUMBER not configured.' });
    }
    if (!patientPhone) {
      return res.status(400).json({ error: 'Missing patientPhone.' });
    }

    const smsBody = buildSmsContent({
      patientName,
      appointmentDate,
      appointmentTime,
    });

    try {
      const result = await twilioClient.messages.create({
        to: patientPhone,
        from: process.env.TWILIO_FROM_NUMBER,
        body: smsBody,
      });

      return res.json({ status: 'sent', providerId: result?.sid });
    } catch (error) {
      console.error('SMS send error:', error);
      return res.status(500).json({ error: 'SMS send failed.' });
    }
  }

  return res.status(400).json({ error: 'Unsupported channel.' });
});

app.listen(port, () => {
  console.log(`Reminder server running on http://localhost:${port}`);
});
