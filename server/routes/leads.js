const express = require('express');
const { validateSchema, schemas } = require('../middleware/validators');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
} = require('../controllers/leadsController');

const router = express.Router();

// Stats (must be before /:id)
router.get('/stats', getLeadStats);

// CRUD
router.get('/', getLeads);
router.get('/:id', getLead);
router.post('/', validateSchema(schemas.lead), createLead);
router.put('/:id', validateSchema(schemas.lead), updateLead);
router.delete('/:id', deleteLead);

module.exports = router;