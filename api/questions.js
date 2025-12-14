const db = require('./db');

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
        const [rows] = await db.query('SELECT * FROM custom_questions');
        const questions = rows.map(r => ({
            id: r.id,
            text: r.question_text,
            type: r.question_type,
            options: r.options ? r.options.split(',') : undefined
        }));
        return res.status(200).json(questions);
    }
    
    else if (req.method === 'POST') {
        const { id, text, type, options } = req.body;
        const optionsStr = options ? options.join(',') : null;
        await db.query(
            'INSERT INTO custom_questions (id, question_text, question_type, options) VALUES (?, ?, ?, ?)',
            [id, text, type, optionsStr]
        );
        return res.status(200).json({ success: true });
    }

    else if (req.method === 'DELETE') {
        const { id } = req.query;
        await db.query('DELETE FROM custom_questions WHERE id = ?', [id]);
        return res.status(200).json({ success: true });
    }
    
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}