const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const { summary, monthly, memberStats, allMembersStats, exportMembersCsv } = require('../controllers/statisticsController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

router.use(authMiddleware);

router.get('/summary', requireRole('admin'), summary);
router.get('/monthly', requireRole('admin'), monthly);
router.get('/members', requireRole('admin'), allMembersStats);
router.get('/members/export', requireRole('admin'), exportMembersCsv);

// Admin or the member themself (ownership enforced in the controller)
router.get('/member/:memberId', param('memberId').isInt().withMessage('Invalid member id'), validateRequest, memberStats);

module.exports = router;
