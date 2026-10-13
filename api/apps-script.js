export default async function handler(req, res) {
  // En-têtes CORS universels pour autoriser les requêtes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SCRIPT_URL = process.env.VITE_APPS_SCRIPT_URL ||
    process.env.APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbzquOsnzDkC8hP-EL2ARuuIPgjADUvByaji4mNcAYCFrvt9bUVkQ6n6vyUHUGRLZfni3A/exec';

  try {
    if (req.method === 'GET') {
      const url = new URL(SCRIPT_URL);
      for (const [key, value] of Object.entries(req.query || {})) {
        url.searchParams.set(key, value);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
      });
      const text = await response.text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(response.status).send(text);
    }

    if (req.method === 'POST') {
      let bodyString = '';
      if (typeof req.body === 'string') {
        bodyString = req.body;
      } else if (req.body && typeof req.body === 'object') {
        bodyString = JSON.stringify(req.body);
      } else {
        bodyString = '';
      }

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: bodyString,
        redirect: 'follow',
      });
      const text = await response.text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(response.status).send(text);
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('Erreur Proxy Apps Script Vercel:', error);
    return res.status(500).json({ error: error.message || 'Erreur proxy' });
  }
}
