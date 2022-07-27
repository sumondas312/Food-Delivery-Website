const express = require("express");
const router = express.Router();
const userLoginController = require("../controllers/userLoginController");
const joiSchemaValidation = require("../middlewares/joiSchemaValidation");
const userSchema = require("../apiSchemas/userSchema");
const tokenValidation = require("../middlewares/tokenValidation");

router.post("/login",
  joiSchemaValidation.validateBody(userSchema.login),
  userLoginController.userLogin
);

router.get("/profile/view",
  tokenValidation.validateToken,
  userLoginController.profileView
);

router.post(
  "/profile/reset/password",
  joiSchemaValidation.validateBody(userSchema.updateRequest),
  tokenValidation.validateToken,
  userLoginController.updateProfilePassword
);

router.post(
  "/request/profile",
  joiSchemaValidation.validateBody(userSchema.profileUpdateRequest),
  tokenValidation.validateToken,
  userLoginController.ProfileUpdaterequest
);

router.post("/add/buyer",
  tokenValidation.validateToken,
  userLoginController.addBuyerProfile
);
// temporary, onlyy asm can add

router.post("/mapping",
  userLoginController.userMapping
);
//1

router.post("/mapping/buyer/creation",
  userLoginController.buyerCreation
);
//2

// router.post("/mapping/buyer",
//   userLoginController.userMasterDataSyncFinal
// );
//3

// router.post('/mapping/multi_access',
//   userLoginController.userMasterMultipleAccessIdentifier
// );
//4 shut down

// router.post("/crew19_developers/conversion", userLoginController.userMasterEmailLowerCaseConversion); // Email conversion api to lower case  // shut down

module.exports = router;
