const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const joiSchemaValidation = require("../middlewares/joiSchemaValidation");
const productSchema = require("../apiSchemas/product.schema");
const tokenValidation = require("../middlewares/tokenValidation");

router.get(
  "/search",
  joiSchemaValidation.validateQueryParams(productSchema.productList),
  tokenValidation.validateToken,
  productController.searchMaterial
);
//tokenValidation.validateToken

module.exports = router;
