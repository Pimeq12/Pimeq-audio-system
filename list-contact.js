import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Clé admin invalide' });
  }

  const { data, error } = await supabase
    .from('messages_contact')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }

  return res.status(200).json({ messages: data });
}
