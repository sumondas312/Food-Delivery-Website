const express = require("express");
const router = express.Router();
const multer = require("multer");
const adminController = require("../controllers/adminController");
const {
  orderListForAdmin,
  singleOrderDetailsForAdmin,
  generateOrderpdfForAdmin,
  exportOrdersForAdmin,
} = require("../controllers/adminController");
const joiSchemaValidation = require("../middlewares/joiSchemaValidation");
const userSchema = require("../apiSchemas/userSchema");
const tokenValidation = require("../middlewares/tokenValidation");
const upload_banner = multer({ dest: "./uploads/banner" });
const orderSchema = require("../apiSchemas/orderSchema");

router.post("/login",
  joiSchemaValidation.validateBody(userSchema.login),
  adminController.adminLogin
);

//offers
// router.post('/add/buyer', adminController.addOffers);

//BUYER
router.post("/add/buyer",
  adminController.addBuyerProfile
);

// users password reset
router.get("/fetch_users",
  tokenValidation.validateToken,
  adminController.fetchAllUsersData
);
router.post("/password/reset/user/:id",
  tokenValidation.validateToken,
  adminController.updateUserPassword
);

// banner img
router.post("/banner/insert",
  upload_banner.single("file"),
  tokenValidation.validateToken,
  adminController.insertBannerImg
);
router.post("/banner/update/:id",
  upload_banner.single("file"),
  tokenValidation.validateToken,
  adminController.updateBannerImg
);
router.get("/banner/fetch_all",
  tokenValidation.validateToken,
  adminController.fetchImageForBanner
);

router.get("/order",
  joiSchemaValidation.validateQueryParams(orderSchema.orderList),
  tokenValidation.validateToken,
  orderListForAdmin
); // secured
router.get("/order/:id",
  tokenValidation.validateToken,
  singleOrderDetailsForAdmin
); // secured
router.get(
  "/order/generate/invoice/",
  joiSchemaValidation.validateQueryParams(orderSchema.downloadOrder),
  tokenValidation.validateToken,
  generateOrderpdfForAdmin
);

router.get(
  "/order/export/orders",
  joiSchemaValidation.validateQueryParams(orderSchema.exportOrder),
  tokenValidation.validateToken,
  exportOrdersForAdmin
); // only for admin

module.exports = router;
