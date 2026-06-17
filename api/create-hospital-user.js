export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const SUPABASE_URL = 'https://yrndxywkngoedcbqrdyo.supabase.co';
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;
  const ANON_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlybmR4eXdrbmdvZWRjYnFyZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjA1OTUsImV4cCI6MjA5NzIzNjU5NX0.gYouKuVeUfZlZK7pzP0R2eURw4oYXZE6F4ORPvG9oBo';

  // ── STEP 1: Verify the caller is a logged-in admin ──
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userToken = authHeader.replace('Bearer ', '');

  // Verify token with Supabase
  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${userToken}`
    }
  });

  const userData = await verifyRes.json();
  if (!verifyRes.ok || userData.user_metadata?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden — admin only' });
  }

  // ── STEP 2: Create the hospital user ──
  const { hospital_id, hospital_name, pin } = req.body;
  const email    = `hospital${hospital_id}@hospitaldb.com`;
  const password = `Hospital${hospital_id}@1234!`;

  try {
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
        user_metadata: { role: 'hospital', hospital_id: Number(hospital_id), hospital_name }
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(400).json({ error: data.msg || JSON.stringify(data) });

    return res.status(200).json({ success: true });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
