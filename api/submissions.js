const db = require('./db');

export default async function handler(req, res) {
  // Vercel Serverless Function
  
  try {
    if (req.method === 'GET') {
      const [rows] = await db.query('SELECT * FROM submissions ORDER BY submission_date DESC');
      
      const submissions = rows.map(row => {
          try {
              const parsed = typeof row.json_data === 'string' ? JSON.parse(row.json_data) : row.json_data;
              return { ...parsed, id: row.id, submissionDate: row.submission_date };
          } catch(e) { return null; }
      }).filter(Boolean);
      
      return res.status(200).json(submissions);
    } 
    
    else if (req.method === 'POST') {
      const data = req.body;
      const { id, fullName, email, phone, submissionDate } = data;
      
      const jsonData = JSON.stringify(data);

      await db.query(
        'INSERT INTO submissions (id, full_name, email, phone, submission_date, json_data) VALUES (?, ?, ?, ?, ?, ?)',
        [id, fullName, email, phone, new Date(submissionDate), jsonData]
      );
      return res.status(200).json({ success: true });
    }

    else if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID required' });
        
        await db.query('DELETE FROM submissions WHERE id = ?', [id]);
        return res.status(200).json({ success: true });
    }

    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}