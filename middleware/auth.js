const jwt=require('jsonwebtoken');
const ErrorResponse=require('../utils/errorResponse');
const AsyncHandler=require('./async');
const User= require('../models/User');

exports.protect =AsyncHandler(async (req,res,next)=>{
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        token=req.headers.authorization.split(' ')[1];
    }
    if (!token){
        return next(new ErrorResponse("You have not permission for this action.",401));
    }
    // else if (req.cookies.token){
    //     token=req.cookies.token;
    // }

    try {
        const decodedUser=jwt.verify(token,process.env.JWT_SECRET);
        req.user=await User.findById(decodedUser.id);
        next();
    }catch (err) {
        next(new ErrorResponse("Internal server error.",500));
    }
});

exports.authorize = (...roles)=>{
    return (req,res,next)=>{
        console.log(req.user);
        if (!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} have not permission for this route.`,403));
        }
        next();
    };
};
