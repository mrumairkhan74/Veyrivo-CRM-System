const express = require('express');
const { validateSchema, schemas } = require('../middleware/validators');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactStats,
} = require('../controllers/contactsController');

const router = express.Router();

router.get('/stats', getContactStats);
router.get('/', getContacts);
router.get('/:id', getContact);
router.post('/', validateSchema(schemas.contact), createContact);
router.put('/:id', validateSchema(schemas.contact), updateContact);
router.delete('/:id', deleteContact);

module.exports = router;