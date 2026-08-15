import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS basique pour autoriser les appels depuis GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { offre, nom, telephone, email, adresse, date, details } = req.body || {};

  if (!offre || !nom || !telephone || !email || !adresse) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    // 1) Enregistrement en base — source de vérité, même si l'email échoue plus tard
    const { data: commande, error: dbError } = await supabase
      .from('commandes')
      .insert([{
        offre,
        nom,
        telephone,
        email,
        adresse,
        date_evenement: date || null,
        details: details || null,
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Erreur Supabase:', dbError);
      return res.status(500).json({ error: "Erreur lors de l'enregistrement de la commande" });
    }

    // 2) Notification par email (ne bloque pas la réussite si Resend échoue :
    //    la commande est déjà en base et reste consultable dans l'admin)
    try {
      await resend.emails.send({
        from: process.env.ORDER_FROM,
        to: process.env.ORDER_EMAIL,
        subject: `Nouvelle commande — Offre ${offre} (${nom})`,
        html: `
          <h2>Nouvelle commande — Offre ${offre}</h2>
          <p><strong>N° commande :</strong> ${commande.id}</p>
          <p><strong>Nom :</strong> ${nom}</p>
          <p><strong>Téléphone :</strong> ${telephone}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Adresse événement :</strong> ${adresse}</p>
          <p><strong>Date événement :</strong> ${date || 'Non précisée'}</p>
          <p><strong>Détails :</strong> ${details || 'Aucun'}</p>
        `,
      });
    } catch (emailError) {
      console.error('Erreur Resend (commande déjà enregistrée en base):', emailError);
    }

    return res.status(200).json({ success: true, id: commande.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
