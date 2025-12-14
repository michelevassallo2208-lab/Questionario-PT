const db = require('./db');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: 'PIN required' });

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