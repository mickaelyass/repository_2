const express = require('express');
const router = express.Router();
const {createEvaluation,getAllEvaluationService,getAllEvaluations,findEvaluationId,updateEvaluation} = require('../controllers/evaluationController');

router.post('/create-evaluation', createEvaluation);
router.get('/', getAllEvaluations);
router.get('/service/:service', getAllEvaluationService);
router.get('/:id', findEvaluationId);
router.put('/:id', updateEvaluation);

module.exports = router;
