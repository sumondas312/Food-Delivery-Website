const express = require("express");
const router = express.Router();
const rppController = require("../controllers/rppController");
// const joiSchemaValidation = require("../middlewares/joiSchemaValidation");
// const orderSchema = require("../apiSchemas/orderSchema");
// const tokenValidation = require('../middlewares/tokenValidation');

router.get("/loyality_reward/:agent_id",
    rppController.loyalityAndReward
); // secured


router.get("/crew19_developers/master_reset",
    rppController.masterReset
); // secured
// router.get("/crew19_developers/xxx/master_reset_all", rppController.masterResetAllX); // secured



module.exports = router;
