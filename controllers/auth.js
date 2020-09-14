const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const AsyncHandler=require('../middleware/async');


//@desc Register new user
//@route POST /api/v1/auth/register
//@access Public
exports.register=AsyncHandler(
    async (req,res,next)=>{
    const {name,password,role,email}=req.body;

    const user =await User.create({
        name,
        password,
        email,
        role,
    }).catch(err=>{
        return next(new ErrorResponse(err.message,400));
    });
        console.log(user);
        const token = user.getSignedJwtToken();
        return res.status(200).json({success:true,token});
});

//@desc Login user
//@route POST /api/v1/auth/login
//@access Public
exports.login=AsyncHandler(
    async (req,res,next)=>{
        const {password,email}=req.body;

        //Validate email and password
        if (!email && !password){
            return  next(new ErrorResponse("Please add email or password.",400));
        }

        //Find user by email
        const user=await User.findOne({email}).select('+password');
        if (!user){
            return  next(new ErrorResponse("User not found with this email.",401));
        }

        user.verifyPassword(password).then(check=>{
            if (!check){
                return  next(new ErrorResponse("Password is incorrect.",401));
            }
                const token = user.getSignedJwtToken();
                return res.status(200).json({success:true,token});
        });
});

//@desc Cookie send response
//@route POST /api/v1/auth/login
//@access Public
exports.cookieSendResponse=AsyncHandler(
    async (req,res,next)=>{
        const {password,email}=req.body;

        //Validate email and password
        if (!email && !password){
            return  next(new ErrorResponse("Please add email or password.",400));
        }

    });




