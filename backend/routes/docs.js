const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');
const router = express.Router();

// simple download link resolver
router.get('/:id', auth, async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await db.getPool();
    const r = await pool.request().input('id', id).query('SELECT * FROM Documents WHERE id=@id');
    if (!r.recordset.length) return res.status(404).send('Not found');
    const doc = r.recordset[0];
    // doc.blob_url is already public link (blob SAS not implemented here) — we return it
    res.json({ url: doc.blob_url, file_name: doc.file_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

module.exports = router;
