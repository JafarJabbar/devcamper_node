const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');
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

//@desc Logout user
//@route GET /api/v1/auth/logout
//@access Private
exports.logout=AsyncHandler(
    async (req,res,next)=>{
        res
        .cookie('token','none',{
            expires:new Date(Date.now()+10*1000),
            httpOnly: true
        });
        return res
            .status(200)
            .json({
                success: true,
                data: {}
            })

    });



//@desc Get logged in user data
//@route GET /api/v1/auth/me
//@access Private
exports.getMe=AsyncHandler(async (req,res,next)=>{
    const user=await User.findById(req.user.id);
    console.log(req.user);
    return res
            .status(200)
            .json({
                success: true,
                data: user
            })
});

//@desc Update logged in user data
//@route PUT /api/v1/auth/update
//@access Private
exports.updateUser  = AsyncHandler(async (req,res,next)=>{
    const updateFields={name:req.body.name,email:req.body.email};

    const user=await User.findByIdAndUpdate(req.user.id,updateFields,{
        new:true,
        runValidators:true
    });
    console.log(req.user);
    return res
            .status(200)
            .json({
                success: true,
                data: user
            })
});

//@desc Update logged in password
//@route PUT /api/v1/auth/password
//@access Private
exports.updatePassword  = AsyncHandler(async (req,res,next)=>{
    const user=await User.findById(req.user.id).select('+password');
    console.log(req.user);
    if (!(await user.verifyPassword(req.body.currentPassword))){
        return next(new ErrorResponse("Password is incorrect.",401));
    }
    user.password=req.body.newPassword;
    await user.save();

    cookieSendResponse(user,200,res);
});


//@desc Forgot password
//@route GET /api/v1/auth/forgot
//@access Public
exports.forgotPassword=AsyncHandler(async (req,res,next)=>{
    if (!req.body.email){
        return  next(new ErrorResponse("Please enter email.",400));
    }
    const user=await User.findOne({email:req.body.email});
    if (!user){
        return  next(new ErrorResponse("User not found with this email. Please register first.",401));
    }

    user.save({validateBeforeSave:false});
    const resetToken=user.getResetPasswordToken();
    console.log(resetToken);
    const resetUrl=`${req.protocol}/${req.get('host')}/app/v1/auth/reset/${resetToken}`;
    const message=`<p>Please enter this URL for reset passport: <a href="${resetUrl}">${resetUrl}</a></p>`;

    try {
        await sendMail({
            email:req.body.email,
            subject:'Password reset',
            message
        });
        return res
            .status(200)
            .json({
                success: true,
                data: "Email sent. Please check your inbox."
            })
    }catch (err) {
        console.log(err);
        user.resetToken=undefined;
        user.resetTokenExpiredDate=undefined;
        return next(new ErrorResponse('This email is not working.Please add valid email.',400));
    }
});


//@desc Reset password
//@route PUT /api/v1/auth/reset/:token
//@access Public
exports.resetPassword=AsyncHandler(async (req,res,next)=>{
    const resetToken=crypto
                        .createHash('sha256')
                        .update(req.params.token)
                        .digest('hex');

    console.log(resetToken);
    console.log(req.params.token);
    const user= await User.findOne({
        resetToken,
        resetTokenExpiredDate:{$gt:Date.now()}
    });

    if (!user){
        return next(new ErrorResponse('Invalid token.',400));
    }

    //Change password
    user.password=req.body.password;
    user.resetToken=undefined;
    user.resetTokenExpiredDate=undefined;
    await user.save({validateBeforeSave: true});
    //Send token to the cookie
    cookieSendResponse(user,200,res);
});



/*
* Send response to browser cookie
*/
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
