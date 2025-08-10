import express from 'express';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'Gestion des Commandes <orders@votredomaine.com>',
      to,
      subject,
      html
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return res.status(400).json({ error });
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }
});

export default router;