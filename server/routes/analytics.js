const express = require('express');
const {
  getDashboardStats,
  getPipelineByStage,
  getLeadsByStatus,
  getLeadsBySource,
  getLeadsByTemperature,
  getMonthlyTrends,
  getTeamPerformance,
  getServicePerformance,
} = require('../controllers/analyticsController');

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/pipeline-by-stage', getPipelineByStage);
router.get('/leads-by-status', getLeadsByStatus);
router.get('/leads-by-source', getLeadsBySource);
router.get('/leads-by-temperature', getLeadsByTemperature);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/team-performance', getTeamPerformance);
router.get('/service-performance', getServicePerformance);

module.exports = router;