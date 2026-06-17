export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { hospital_id, hospital_name, pin } = req.body;

  const SUPABASE_URL = 'https://yrndxywkngoedcbqrdyo.supabase.co';
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;

  const email    = `hospital${hospital_id}@hospitaldb.com`;
  const password = `Hospital${hospital_id}@1234!`;

  // Create auth user
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'hospital', hospital_id, hospital_name }
    })
  });

  const data = await r.json();
  if (!r.ok) return res.status(400).json({ error: data });

  res.status(200).json({ success: true });
}
