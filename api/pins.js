const db = require('./db');

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
        const [rows] = await db.query('SELECT code, label, must_change as mustChange FROM access_pins');
        const pins = rows.map(p => ({...p, mustChange: !!p.mustChange}));
        return res.status(200).json(pins);
    }
    
    else if (req.method === 'POST') {
        const { code, label } = req.body;
        if (!code || !label) return res.status(400).json({ error: 'Missing data' });
        
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
        await db.query('DELETE FROM access_pins WHERE code = ?', [code]);
        return res.status(200).json({ success: true });
    }

    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}