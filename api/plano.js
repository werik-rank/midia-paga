// Lê a aba "TOTAL RESUMIDO POR PRODUTO 2026" via Google Sheets API (conta de serviço).
// Env: GOOGLE_SERVICE_ACCOUNT_JSON (JSON completo da chave), SHEET_ID (opcional)
const crypto = require('crypto');
const SHEET_ID = process.env.SHEET_ID || '10yUvFgZtF1TL-cryrzInT5wx1TbAQ_zKAXeuC-yxyGs';
const RANGE = "'TOTAL RESUMIDO POR PRODUTO 2026'!A1:L99";
const b64 = (b) => Buffer.from(b).toString('base64url');

async function token(sa) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64(JSON.stringify({alg: 'RS256', typ: 'JWT'}));
  const body = b64(JSON.stringify({iss: sa.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600}));
  const sig = crypto.createSign('RSA-SHA256').update(head + '.' + body).sign(sa.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: head + '.' + body + '.' + sig})});
  const j = await r.json();
  if (!j.access_token) throw new Error('Google auth: ' + (j.error_description || j.error));
  return j.access_token;
}

module.exports = async (req, res) => {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON não configurada');
    const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const t = await token(sa);
    const r = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + encodeURIComponent(RANGE) +
      '?valueRenderOption=FORMATTED_VALUE', {headers: {authorization: 'Bearer ' + t}});
    const j = await r.json();
    if (!r.ok) throw new Error('Sheets API: ' + ((j.error && j.error.message) || r.status));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({values: j.values || []});
  } catch (e) {
    res.status(500).json({error: String(e.message || e)});
  }
};
