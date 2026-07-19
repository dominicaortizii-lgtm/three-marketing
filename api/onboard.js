// Vercel serverless function — sends onboarding notification via Resend.
// Key lives in Vercel env var RESEND_API_KEY, never in client code.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { subject, text } = req.body || {};
  if (!subject || !text) return res.status(400).json({ error: 'missing fields' });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'dominic@3consulting.us',
        to: ['dominicaortizii@gmail.com'],   // fixed server-side — endpoint can't be abused to email others
        subject: String(subject).slice(0, 200),
        text: String(text).slice(0, 10000)
      })
    });
    if (!r.ok) {
      console.error('Resend error:', await r.text());
      return res.status(502).json({ error: 'send failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  }
}
