const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');

router.post('/register', utilisateurController.register);
router.post('/login', utilisateurController.login);
router.get('/', utilisateurController.getAll);
router.get('/:id', utilisateurController.getById);
router.put('/:id', utilisateurController.update);
router.delete('/:id', utilisateurController.delete);
router.post('/request-reset', utilisateurController.requestReset);
router.post('/reset-password/:token', utilisateurController.resetPassword);

module.exports = router;
