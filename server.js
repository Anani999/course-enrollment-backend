const express = require('express');
const setupMiddlewares = require('./config/middlewares');
const routes = require('./routes');

// Initialize the Express
const app = express();

// set Middlewares
setupMiddlewares(app);

// set API's 
app.use('/api',routes);

// listen on PORT 5000
app.listen(process.env.PORT || 5000,() => console.log(`Running on Port ${process.env.PORT}`));
