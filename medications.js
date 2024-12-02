const express = require('express');
const db = require('./database');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM medications WHERE user_id = ?', [req.session.userId], (err, medications) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(medications);
  });
});


router.post('/', authMiddleware, (req, res) => {
  const { name, dosage, frequency, time } = req.body;

  if (!name || !dosage || !frequency || !time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  db.run(
    'INSERT INTO medications (name, dosage, frequency, time, user_id) VALUES (?, ?, ?, ?, ?)',
    [name, dosage, frequency, time, req.session.userId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json({ message: 'Medication added successfully!' });
    }
  );
});


router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM medications WHERE id = ? AND user_id = ?', [id, req.session.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ message: 'Medication deleted successfully!' });
  });
});

module.exports = router;

