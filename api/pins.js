const db = require('./db');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
        const [rows] = await db.query('SELECT code, label, must_change as mustChange FROM access_pins');
        // Convert bool (0/1) to JS boolean
        const pins = rows.map(p => ({...p, mustChange: !!p.mustChange}));
        return res.status(200).json(pins);
    }
    
    else if (req.method === 'POST') {
        const { code, label } = req.body;
        await db.query('INSERT INTO access_pins (code, label, must_change) VALUES (?, ?, 0)', [code, label]);
        return res.status(200).json({ success: true });
    }

    else if (req.method === 'PUT') {
        const { oldCode, newCode } = req.body;
        await db.query('UPDATE access_pins SET code = ?, must_change = 0 WHERE code = ?', [newCode, oldCode]);
        return res.status(200).json({ success: true });
    }

    else if (req.method === 'DELETE') {
        const { code } = req.query;
        // Prevent deleting the last pin is handled by frontend, but could add check here
        await db.query('DELETE FROM access_pins WHERE code = ?', [code]);
        return res.status(200).json({ success: true });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}