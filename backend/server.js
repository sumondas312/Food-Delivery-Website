const express = require('express');
var compression = require('compression');
const dotEnv = require('dotenv');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api.yaml');
const dbConnection = require('./database/connection');
const fs = require('fs');

const bodyParser = require('body-parser');

const version = 'v2';
dotEnv.config();
const app = express();

dbConnection();

// cors
app.use(cors());

// request payload middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());
// parse application/x-www-form-urlencoded

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
// parse application/json
app.use(bodyParser.json({ limit: '50mb' }));
// parse application/json

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//all login
app.use('/api/' + version + '/user', require('./routes/userLoginRoutes'));
//all imports
app.use('/api/' + version + '/import', require('./routes/importRoutes'));
app.use('/api/' + version + '/product', require('./routes/productRoutes'));
app.use('/api/' + version + '/cart', require('./routes/cartRoutes'));
app.use('/api/' + version + '/booking', require('./routes/bookingRoutes'));
app.use('/api/' + version + '/order', require('./routes/orderRoutes'));
app.use('/api/' + version + '/rpp', require('./routes/rppRoutes'));
app.use('/api/' + version + '/complaint', require('./routes/complaintRoutes'));
app.use('/api/' + version + '/admin', require('./routes/adminRoutes'));
app.use('/api/' + version + '/store', require('./routes/storeRoutes'));
app.use('/api/' + version + '/feedback', require('./routes/feedbackRoutes'));
app.use('/api/' + version + '/customer', require('./routes/customerRoutes'));
app.use('/api/' + version + '/promote', require('./routes/promoteRoutes'));
app.use('/api/' + version + '/report', require('./routes/reportRoutes'));
app.use('/api/' + version + '/food', require('./routes/foodRoutes'));
// API Documentation
// if (process.env.NODE_ENV != 'production') {
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// }
app.use('/uploads', express.static('./uploads'));
app.use('/downloads', express.static('./downloads'));
const PORT = process.env.PORT || 7007;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// error handler middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({
    status: 500,
    message: err.message,
    body: {},
  });
});
