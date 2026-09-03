const express = require('express');
const { validateSchema, schemas } = require('../middleware/validators');
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companiesController');

const router = express.Router();

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', validateSchema(schemas.company), createCompany);
router.put('/:id', validateSchema(schemas.company), updateCompany);
router.delete('/:id', deleteCompany);

module.exports = router;