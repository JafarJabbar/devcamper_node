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
    }).then(oneUser=>{
        cookieSendResponse(oneUser,200,res)
    }).catch(err=>{
        return next(new ErrorResponse(err.message,400));
    });
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
            }else {
                cookieSendResponse(user,200,res)
            }
        });
});

const cookieSendResponse=AsyncHandler(
    async (user,statusCode,res)=>{
        const options= {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRED * 24 * 60 * 60 * 1000),
            httpOnly: false
        };
        if (process.env.NODE_ENV==='production'){
            options.secure=true;
        }

        const token = user.getSignedJwtToken();

        return res
                .status(statusCode)
                .cookie('token',token,options)
                .json({success:true,token});
});

//@desc Get logged in user data
//@route GET /api/v1/auth/me
//@access Private
exports.getMe=AsyncHandler(async (req,res,next)=>{
    const user=await User.findById(req.user._conditions._id);
    console.log(req.user._conditions._id);
    return res
            .status(200)
            .json({
                success: true,
                data: user
            })
});
