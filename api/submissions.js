const db = require('./db');

export default async function handler(req, res) {
  // CORS headers for Vercel Serverless
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // We retrieve the full JSON blob.
      const [rows] = await db.query('SELECT * FROM submissions ORDER BY submission_date DESC');
      
      const submissions = rows.map(row => {
          try {
              // The json_data column contains the FULL object structure
              const parsed = typeof row.json_data === 'string' ? JSON.parse(row.json_data) : row.json_data;
              // We merge it with the top-level columns just in case, though json_data has everything
              return { ...parsed, id: row.id, submissionDate: row.submission_date };
          } catch(e) { return null; }
      }).filter(Boolean);
      
      return res.status(200).json(submissions);
    } 
    
    else if (req.method === 'POST') {
      const data = req.body;
      const { id, fullName, email, phone, submissionDate } = data;
      
      // We serialize the entire questionnaire data into the JSON column
      const jsonData = JSON.stringify(data);

      await db.query(
        'INSERT INTO submissions (id, full_name, email, phone, submission_date, json_data) VALUES (?, ?, ?, ?, ?, ?)',
        [id, fullName, email, phone, new Date(submissionDate), jsonData]
      );
      return res.status(200).json({ success: true });
    }

    else if (req.method === 'DELETE') {
        const { id } = req.query;
        await db.query('DELETE FROM submissions WHERE id = ?', [id]);
        return res.status(200).json({ success: true });
    }

    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}