const express = require("express");
const router = express.Router();
// Définition des routes
const { savePresence,getAllPresences,getPresencesByDate }=require ('../controllers/presenceController');



router.get("/", getAllPresences);
router.get("/:date",getPresencesByDate);
router.post("/", savePresence);

module.exports = router;