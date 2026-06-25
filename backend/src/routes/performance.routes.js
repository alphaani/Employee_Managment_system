const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate, createPerformanceSchema, updatePerformanceSchema } = require('../middleware/validate.middleware');

router.get('/my', protect, authorize('employee'), performanceController.getMyEvaluations);

router.get('/', protect, authorize('admin'), performanceController.getAllEvaluations);
router.get('/:id', protect, performanceController.getEvaluation);
router.post('/', protect, authorize('admin'), validate(createPerformanceSchema), performanceController.createEvaluation);
router.put('/:id', protect, authorize('admin'), validate(updatePerformanceSchema), performanceController.updateEvaluation);
router.delete('/:id', protect, authorize('admin'), performanceController.deleteEvaluation);

module.exports = router;
