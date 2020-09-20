const express = require('express');
const dotenv = require('dotenv');
const morgan=require('morgan');
const connectDb=require('./config/db');
const cookieParser=require('cookie-parser');
const colors = require('colors');
const sanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const limit = require('express-rate-limit');
const hpp = require('hpp');
const errorHandler = require('./middleware/error');
dotenv.config({path: './config/config.env'});

//Express app
const app=express();

//Body parser
app.use(express.json());

//Mongo sanitize
app.use(sanitize());

//Declare rate-limiter
const limiter=limit({
    windowMs: 10*60*1000,
    max:100
});
app.use(limit);

//Set security headers data
app.use(helmet());

//Prevent xss attacks
app.use(xss());

//Prevent http params pollution
app.use(hpp());

//cors
app.use(cors());

//Database connection
connectDb();

//Env variables
if (process.env.NODE_ENV==='development'){
    app.use(morgan('development'));
}
app.use(cookieParser());

//Fetch routes
const bootcamps=require('./routes/bootcamps');
const courses=require('./routes/courses');
const auth=require('./routes/auth');
const users=require('./routes/users');
const reviews=require('./routes/reviews');

//Mount routes
app.use('/app/v1/bootcamps/',bootcamps);
app.use('/app/v1/courses/',courses);
app.use('/app/v1/auth/',auth);
app.use('/app/v1/users/',users);
app.use('/app/v1/reviews/',reviews);

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

