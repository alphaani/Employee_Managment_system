const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate, submitLeaveSchema } = require('../middleware/validate.middleware');

router.post('/', protect, authorize('employee'), validate(submitLeaveSchema), leaveController.submitLeave);
router.get('/my', protect, authorize('employee'), leaveController.getMyLeaves);

router.get('/', protect, authorize('admin'), leaveController.getAllLeaves);
router.get('/:id', protect, leaveController.getLeave);
router.delete('/:id', protect, authorize('employee'), leaveController.deleteLeave);
router.patch('/:id/approve', protect, authorize('admin'), leaveController.approveLeave);
router.patch('/:id/reject', protect, authorize('admin'), leaveController.rejectLeave);

module.exports = router;
