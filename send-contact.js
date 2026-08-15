import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { nom, telephone, email, sujet, message } = req.body || {};

  if (!nom || !telephone || !email || !message) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    const { data: msg, error: dbError } = await supabase
      .from('messages_contact')
      .insert([{ nom, telephone, email, sujet: sujet || null, message }])
      .select()
      .single();

    if (dbError) {
      console.error('Erreur Supabase:', dbError);
      return res.status(500).json({ error: "Erreur lors de l'enregistrement du message" });
    }

    try {
      await resend.emails.send({
        from: process.env.ORDER_FROM,
        to: process.env.ORDER_EMAIL,
        subject: `Nouveau message de contact — ${nom}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>N° message :</strong> ${msg.id}</p>
          <p><strong>Nom :</strong> ${nom}</p>
          <p><strong>Téléphone :</strong> ${telephone}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Type d'événement :</strong> ${sujet || 'Non précisé'}</p>
          <p><strong>Message :</strong><br>${message}</p>
        `,
      });
    } catch (emailError) {
      console.error('Erreur Resend (message déjà enregistré en base):', emailError);
    }

    return res.status(200).json({ success: true, id: msg.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
