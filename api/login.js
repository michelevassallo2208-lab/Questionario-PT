const db = require('./db');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pin } = req.body;
    const [rows] = await db.query('SELECT * FROM access_pins WHERE code = ?', [pin]);

    if (rows.length > 0) {
        return res.status(200).json({ 
            valid: true, 
            mustChange: !!rows[0].must_change 
        });
    } else {
        return res.status(200).json({ valid: false });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}