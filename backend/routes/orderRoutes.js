const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const joiSchemaValidation = require("../middlewares/joiSchemaValidation");
const orderSchema = require("../apiSchemas/orderSchema");
const tokenValidation = require("../middlewares/tokenValidation");
const importController = require('../controllers/importController');
const multer = require('multer');
const mainFile = multer({ dest: './uploads/main/' })

router.post('/importcsvorder',
    mainFile.single('file'),
    orderController.importcsvorder
);

router.post(
    "/temp/insert",
    joiSchemaValidation.validateBody(orderSchema.insertToTemporaryOrder),
    tokenValidation.validateToken,
    orderController.createTemporaryOrder
);

router.post(
    "/re_order",
    joiSchemaValidation.validateBody(orderSchema.transferOrder),
    tokenValidation.validateToken,
    orderController.transferToCart
);

router.post(
    "/insert",
    joiSchemaValidation.validateBody(orderSchema.insertToOrder),
    tokenValidation.validateToken,
    orderController.createOrder
);

router.get("/",
    joiSchemaValidation.validateQueryParams(orderSchema.orderList),
    tokenValidation.validateToken,
    orderController.orderList
);
router.get(
    "/:id",
    joiSchemaValidation.validateQueryParams(orderSchema.singleOrderList),
    tokenValidation.validateToken,
    orderController.singleOrderDetails
);

router.get(
    "/generate/invoice/",
    joiSchemaValidation.validateQueryParams(orderSchema.downloadOrder),
    tokenValidation.validateToken,
    orderController.generateOrderpdf
);
router.get("/export/orders",
    tokenValidation.validateToken,
    orderController.exportOrders
);

module.exports = router;
