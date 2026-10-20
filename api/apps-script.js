// Cache mémoire in-process Vercel Serverless
const serverCache = new Map();
const SERVER_CACHE_TTL_MS = 1000 * 90; // 90 secondes

async function sendToAppsScript(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    redirect: 'follow',
  });
  const text = await response.text();
  return { status: response.status, text };
}

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
      const queryEntries = Object.entries(req.query || {}).sort(([a], [b]) => a.localeCompare(b));
      for (const [key, value] of queryEntries) {
        url.searchParams.set(key, value);
      }

      const cacheKey = url.searchParams.toString();
      const action = req.query?.action || '';

      // Ne pas cacher le check_slug ni le ping
      const isCachable = action !== 'check_slug' && action !== 'ping';

      // 1. Vérifier si la réponse est en mémoire vive du serveur Vercel (servie en ~2ms)
      if (isCachable) {
        const cached = serverCache.get(cacheKey);
        if (cached && Date.now() - cached.time < SERVER_CACHE_TTL_MS) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, s-maxage=90, stale-while-revalidate=600');
          res.setHeader('X-GQ-Cache', 'HIT');
          return res.status(200).send(cached.text);
        }
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
      });
      const text = await response.text();

      // Mettre en cache mémoire si succès
      if (isCachable && response.status === 200 && text.trim().startsWith('{')) {
        serverCache.set(cacheKey, { text, time: Date.now() });
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=90, stale-while-revalidate=600');
      res.setHeader('X-GQ-Cache', 'MISS');
      return res.status(response.status).send(text);
    }

    if (req.method === 'POST') {
      // Invalidation immédiate du cache lors de toute écriture
      serverCache.clear();

      let data = null;
      try {
        data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {}

      // Gestion intelligente du mot de passe admin : accepte 'gq-store'
      if (data && data.action === 'login') {
        const { password } = data;
        if (password === 'gq-store' || password === 'admin') {
          let result = await sendToAppsScript(SCRIPT_URL, data);
          try {
            const parsed = JSON.parse(result.text);
            if (!parsed.success) {
              const fallbackPassword = password === 'gq-store' ? 'admin' : 'gq-store';
              result = await sendToAppsScript(SCRIPT_URL, { ...data, password: fallbackPassword });
            }
          } catch {}
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.status(result.status).send(result.text);
        }
      }

      // Enregistrement atomique ultra-rapide d'un produit (produit + images + specs)
      if (data && data.action === 'save_product_full') {
        let result = await sendToAppsScript(SCRIPT_URL, data);
        let parsed = null;
        try {
          parsed = JSON.parse(result.text);
        } catch {}

        if (parsed && parsed.success) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.status(result.status).send(result.text);
        }

        // Orchestration parallèle côté Vercel si script distant ancien
        if (!parsed || (!parsed.success && parsed.error && parsed.error.includes('inconnue'))) {
          const { product, images, specs } = data;
          const prodRes = await sendToAppsScript(SCRIPT_URL, { action: 'upsert_product', product });
          const prodParsed = JSON.parse(prodRes.text);
          if (!prodParsed.success) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(prodRes.status).send(prodRes.text);
          }
          const savedProduct = prodParsed.data;

          await Promise.all([
            images ? sendToAppsScript(SCRIPT_URL, {
              action: 'save_product_images',
              product_id: savedProduct.id,
              images: images || [],
            }) : Promise.resolve(),
            specs ? sendToAppsScript(SCRIPT_URL, {
              action: 'save_product_specs',
              product_id: savedProduct.id,
              specs: specs || [],
            }) : Promise.resolve(),
          ]);

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.status(200).send(JSON.stringify({ success: true, data: savedProduct }));
        }
      }

      const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      const result = await sendToAppsScript(SCRIPT_URL, bodyString);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(result.status).send(result.text);
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('Erreur Proxy Apps Script Vercel:', error);
    return res.status(500).json({ error: error.message || 'Erreur proxy' });
  }
}
