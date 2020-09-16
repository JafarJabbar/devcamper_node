const User =require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const AsyncHandler=require('../middleware/async');


//@desc Get all users
//@route GET /api/v1/users
//@access Private/Admin
exports.getUsers =AsyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

//@desc Get single user
//@route GET /api/v1/users/:id
//@access Private/Admin
exports.getUser =AsyncHandler(async (req, res, next) => {
    const user=await User.findById(req.params.id);

    if(!user){
        next(new ErrorResponse(`No user on id of ${req.params.id}`),404);
    }

    res.status(200).json({
        success:true,
        data:user
    });
});

//@desc Create new user
//@route POST /api/v1/users
//@access Private/Admin
exports.createUser =AsyncHandler(async (req, res, next) => {
    const user=await User.create(req.body);
    res.status(201).json({
        success:true,
        data:user
    });
});

//@desc Update single user data
//@route PUT /api/v1/users/:id
//@access Private/Admin
exports.updateUser =AsyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if(!user){
        next(new ErrorResponse(`No user on id of ${req.params.id}`),404);
    }

     user = await User.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

//@desc Delete single user data
//@route DELETE /api/v1/users/:id
//@access Private/Admin
exports.deleteUser =AsyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if(!user){
        next(new ErrorResponse(`No user on id of ${req.params.id}`),404);
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    });
});


