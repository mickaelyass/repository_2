const express = require("express");
const router = express.Router();
// Définition des routes
const { savePresence,getAllPresences,getPresencesByDate }=require ('../controllers/presenceController');



router.get("/presences", getAllPresences);
router.get("/presences/:date",getPresencesByDate);
router.post("/presences", savePresence);

module.exports = router;