const express = require('express');
const { validateSchema, schemas } = require('../middleware/validators');
const {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getUpcomingActivities,
  getOverdueActivities,
  getActivityStats,
} = require('../controllers/activitiesController');

const router = express.Router();

router.get('/stats', getActivityStats);
router.get('/upcoming', getUpcomingActivities);
router.get('/overdue', getOverdueActivities);
router.get('/', getActivities);
router.get('/:id', getActivity);
router.post('/', validateSchema(schemas.activity), createActivity);
router.put('/:id', validateSchema(schemas.activity), updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;