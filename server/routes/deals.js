const express = require('express');
const { validateSchema, schemas } = require('../middleware/validators');
const {
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealStats,
} = require('../controllers/dealsController');

const router = express.Router();

router.get('/stats', getDealStats);
router.get('/', getDeals);
router.get('/:id', getDeal);
router.post('/', validateSchema(schemas.deal), createDeal);
router.put('/:id', validateSchema(schemas.deal), updateDeal);
router.delete('/:id', deleteDeal);

module.exports = router;