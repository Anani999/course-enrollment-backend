const cors = require('cors');
const express = require('express');
const path = require('path');
const { configDotenv } = require('dotenv');

const connectDB = require('../config/db');
const setupMiddlewares = async(app) => {

    // configuring dot env to use environment variables
    configDotenv();

    // configuring cors so included origins only access the API's
    app.use(cors({
        origin:'http://localhost:3000',
        methods:["POST","GET"],
    }));
    
    // express.json middleware to automatically parse response body to jsong 
    app.use(express.json());

    // serving static files from ../static folder 
    // __dirname value is the path to this folder 
    app.use(express.static(path.join(__dirname,'..','static')));

    // serving the files in ../upload folder 
    app.use('/uploads',express.static(path.join(__dirname,'..','uploads')));

    // serving files in courses direcotry
    app.use('/course-files',express.static(path.join(__dirname,'..','courses')));

    // after all the above were done showing message in console
    console.log('Midlewares were succesfully set');

    // connecting to Database
    await connectDB();
}

module.exports = setupMiddlewares;