const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const joiSchemaValidation = require("../middlewares/joiSchemaValidation");
const bookingSchema = require("../apiSchemas/booking.schema");
const tokenValidation = require("../middlewares/tokenValidation");

router.get(
  "/",
  joiSchemaValidation.validateQueryParams(bookingSchema.booking),
  tokenValidation.validateToken,
  bookingController.seasonsData
);

router.get(
  "/seasons_info",
  tokenValidation.validateToken,
  bookingController.seasonsInfo
);

router.get(
  "/buyer",
  joiSchemaValidation.validateQueryParams(bookingSchema.buyer_data),
  tokenValidation.validateToken,
  bookingController.buyerData
);

// router.get('/buyer/:agent_id', bookingController.buyerData);
// router.get('/agent_list', tokenValidation.validateToken, bookingController.agentList);

router.get(
  "/family_tree",
  joiSchemaValidation.validateQueryParams(bookingSchema.family_tree),
  tokenValidation.validateToken,
  bookingController.familyTree
);

router.get(
  "/search_user/:id",
  joiSchemaValidation.validateQueryParams(bookingSchema.familyTreeHierarchy),
  tokenValidation.validateToken,
  bookingController.familyTreeHierarchy
);

router.get("/banner/fetch_all",
  tokenValidation.validateToken,
  bookingController.fetchImageForBanner
);

module.exports = router;
