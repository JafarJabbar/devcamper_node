const express = require('express');
const dotenv = require('dotenv');
const morgan=require('morgan');
const connectDb=require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
dotenv.config({path: './config/config.env'});

//Express app
const app=express();

//Body parser
app.use(express.json());

//Database connection
connectDb();

//Env variables
if (process.env.NODE_ENV==='development'){
    app.use(morgan('development'));
}

//Fetch routes
const bootcamps=require('./routes/bootcamps');
const courses=require('./routes/courses');

//Mount routes
app.use('/app/v1/bootcamps/',bootcamps);
app.use('/app/v1/courses/',courses);

//Error handling middleware
app.use(errorHandler);


//Port variable
const  PORT = process.env.PORT || 5000;

//Listen port and start server
const server=app.listen(PORT,()=>{
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.cyan.bgYellow.italic)
});


//Handle unhandled rejection
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Unhandled rejection: ${err.message}`);
    server.close(()=>process.exit(1));
});

