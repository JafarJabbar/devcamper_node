const User =require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const AsyncHandler=require('../middleware/async');


//@desc Register new user
//@route PUT /api/v1/auth/register
//@access Public
exports.register=AsyncHandler(
    async (req,res,next)=>{
    const {name,password,role,email}=req.body;

    const user=User.create({
        name,
        password,
        email,
        role,
    });
    const token = user.getSignedJwtToken();
    return res.status(200).json({success:true,token});
});

