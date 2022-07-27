const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const multer = require('multer');
const mainFile = multer({ dest: './uploads/main/' });
const tokenValidation = require('../middlewares/tokenValidation');



router.post('/main-file',
    mainFile.single('file'),
    importController.importMainFile
);
router.post('/user-master',
    mainFile.single('file'),
    importController.importUserMaster
);
router.post("/product",
    mainFile.single("file"),
    importController.importProductFile
);

router.post('/zsd_customer_details',
    mainFile.single('file'),
    importController.importZsdCustomerDetails
);
router.post('/zml_designation',
    mainFile.single('file'),
    importController.importZmlDesignation
);


router.post('/correction',
    importController.correctionApi
); //1


module.exports = router;