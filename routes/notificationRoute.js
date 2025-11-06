const express = require('express');
const router = express.Router();
const {getAllNotification,getNotificationByMatricule,updateNotificationRead}= require('../controllers/notificationController');

router.get('/', getAllNotification);
router.get('/:matricule', getNotificationByMatricule);
router.put('/read/:id', updateNotificationRead);

module.exports = router;
