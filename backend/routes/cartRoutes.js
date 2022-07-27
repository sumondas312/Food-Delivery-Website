const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const joiSchemaValidation = require("../middlewares/joiSchemaValidation");
const cartSchema = require("../apiSchemas/cartSchema");
const tokenValidation = require("../middlewares/tokenValidation");

router.post(
  "/insert",
  joiSchemaValidation.validateBody(cartSchema.insertToCart),
  tokenValidation.validateToken,
  cartController.insertToCart
); // secured

router.get(
  "/search",
  joiSchemaValidation.validateQueryParams(cartSchema.fetchAllCartItems),
  tokenValidation.validateToken,
  cartController.searchCartItems
); // secured
router.get("/search/:id",
  tokenValidation.validateToken,
  cartController.searchSingleCartItems
); // secured
router.patch(
  "/update/:id",
  joiSchemaValidation.validateBody(cartSchema.updateToCart),
  tokenValidation.validateToken,
  cartController.updateCartItem
); // secured
router.delete("/delete/:id",
  tokenValidation.validateToken,
  cartController.deleteCartItem
); // secured

router.delete("/clear",
  tokenValidation.validateToken,
  cartController.clearAllCartItems
); // secured

module.exports = router;
