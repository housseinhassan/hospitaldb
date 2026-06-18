export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const { type, hospital_name, contact_email, patient } = req.body;

  let subject, html;

  if(type === 'new_patient') {
    subject = `🏥 New Patient Added — ${hospital_name}`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0d1117;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="color:#38bdf8;margin:0">🏥 HospitalDB</h2>
          <p style="color:#64748b;margin:4px 0 0">New Patient Notification</p>
        </div>
        <div style="background:#161b22;padding:24px;border-radius:0 0 8px 8px;border:1px solid #2a3441">
          <h3 style="color:#e2e8f0;margin:0 0 16px">New Patient Added</h3>
          <p style="color:#94a3b8;margin:0 0 16px">A new patient has been added to <strong style="color:#38bdf8">${hospital_name}</strong></p>
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:1px solid #2a3441">
              <td style="padding:10px;color:#64748b;width:140px">Patient Name</td>
              <td style="padding:10px;color:#e2e8f0"><strong>${patient.first_name} ${patient.last_name}</strong></td>
            </tr>
            <tr style="border-bottom:1px solid #2a3441">
              <td style="padding:10px;color:#64748b">Date of Birth</td>
              <td style="padding:10px;color:#e2e8f0">${patient.dob || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #2a3441">
              <td style="padding:10px;color:#64748b">Blood Type</td>
              <td style="padding:10px;color:#e2e8f0">${patient.blood_type || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #2a3441">
              <td style="padding:10px;color:#64748b">Gender</td>
              <td style="padding:10px;color:#e2e8f0">${patient.gender || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px;color:#64748b">Status</td>
              <td style="padding:10px"><span style="background:#052e16;color:#4ade80;padding:2px 10px;border-radius:10px;font-size:12px">${patient.status}</span></td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:12px;background:#0d1117;border-radius:6px">
            <p style="color:#64748b;font-size:12px;margin:0">
              📅 ${new Date().toLocaleDateString()} · HospitalDB Platform
            </p>
          </div>
        </div>
      </div>`;
  }

  else if(type === 'critical_patient') {
    subject = `🚨 CRITICAL PATIENT ALERT — ${hospital_name}`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#450a0a;padding:20px;border-radius:8px 8px 0 0;border-bottom:3px solid #f87171">
          <h2 style="color:#f87171;margin:0">🚨 CRITICAL ALERT</h2>
          <p style="color:#fca5a5;margin:4px 0 0">Immediate attention required</p>
        </div>
        <div style="background:#161b22;padding:24px;border-radius:0 0 8px 8px;border:1px solid #7f1d1d">
          <h3 style="color:#f87171;margin:0 0 16px">Patient Status Changed to Critical</h3>
          <p style="color:#94a3b8;margin:0 0 16px">A patient at <strong style="color:#38bdf8">${hospital_name}</strong> has been marked as <strong style="color:#f87171">CRITICAL</strong></p>
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:1px solid #2a3441">
              <td style="padding:10px;color:#64748b;width:140px">Patient Name</td>
              <td style="padding:10px;color:#e2e8f0"><strong>${patient.first_name} ${patient.last_name}</strong></td>
            </tr>
            <tr style="border-bottom:1px solid #2a3441">
              <td style="padding:10px;color:#64748b">Patient ID</td>
              <td style="padding:10px;color:#38bdf8">#${patient.id}</td>
            </tr>
            <tr style="border-bottom:1px solid #2a3441">
              <td style="padding:10px;color:#64748b">Blood Type</td>
              <td style="padding:10px;color:#e2e8f0">${patient.blood_type || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px;color:#64748b">Status</td>
              <td style="padding:10px"><span style="background:#3b0764;color:#c084fc;padding:2px 10px;border-radius:10px;font-size:12px">🚨 CRITICAL</span></td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:12px;background:#450a0a;border-radius:6px;border:1px solid #7f1d1d">
            <p style="color:#fca5a5;font-size:12px;margin:0">
              ⚠️ Please log in to HospitalDB immediately to review this patient.
            </p>
          </div>
          <div style="margin-top:12px;padding:12px;background:#0d1117;border-radius:6px">
            <p style="color:#64748b;font-size:12px;margin:0">
              📅 ${new Date().toLocaleDateString()} · HospitalDB Platform
            </p>
          </div>
        </div>
      </div>`;
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'HospitalDB <onboarding@resend.dev>',
        to: [contact_email],
        subject,
        html
      })
    });

    const data = await r.json();
    if(!r.ok) return res.status(400).json({ error: data });
    return res.status(200).json({ success: true });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
