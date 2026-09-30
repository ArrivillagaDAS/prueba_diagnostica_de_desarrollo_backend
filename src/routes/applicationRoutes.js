const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.post('/', applicationController.createApplication);
router.get('/', applicationController.getApplications);
router.put('/:id/status', applicationController.updateApplicationStatus);

module.exports = router;