const Review =require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const AsyncHandler=require('../middleware/async');
const Bootcamp = require("../models/Bootcamp");

//@desc Get all reviews
//@route GET /api/v1/reviews
//@route GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.getReviews =AsyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId){
        query = Review.find({bootcamp:req.params.bootcampId });
        let reviews=await query;
        res.status(200).json({
            success:true,
            count:reviews.length,
            data:reviews
        });
    }else {
        res.status(200).json(res.advancedResults);
    }
});


//@desc Get single review
//@route GET /api/v1/reviews/:id
//@access Public
exports.getReview =AsyncHandler(async (req, res, next) => {
    let query;
    query = Review.findById(req.params.id ).populate({
        path:'bootcamp',
        select:'name description'
    });

    let review=await query;

    if (!review){
        next(new ErrorResponse(`No review in id of ${req.params.id} `),404);
    }
    res.status(200).json({
        success:true,
        data:review
    });
});

//@desc Add review
//@route POST /api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.createReview =AsyncHandler(async (req, res, next) => {
    req.body.bootcamp=req.params.bootcampId;
    req.body.user=req.user.id;

    let query;
    let bootcamp=Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        next(new ErrorResponse(`No bootcamp on id of ${req.params.bootcampId}`),404);
    }


    query=Review.create(req.body);
    let review=await query;
    res.status(200).json({
        success:true,
        data: review
    });
});

//@desc Update review
//@route PUT /api/v1/reviews/:id
//@access Private
exports.updateReview =AsyncHandler(async (req, res, next) => {
    let review=await Review.findById(req.params.id);
    if(!review){
        next(new ErrorResponse(`No review on id of ${req.params.id}`),404);
    }


    //Check user ownership over bootcamp
    if(req.user.id !==review.user.toString() && req.user.role !== 'Admin' ){
        return next(
            new ErrorResponse(`User with id of ${req.user.id} have not permission to update this review.`,401)
        );
    }


    review = await Review.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        success:true,
        data:review
    });
});

//@desc Delete review
//@route Delete /api/v1/reviews/:id
//@access Private
exports.deleteReview =AsyncHandler(async (req, res, next) => {
    let review=await Review.findById(req.params.id);
    if(!review){
        next(new ErrorResponse(`No review on id of ${req.params.id}`),404);
    }

    //Check user ownership over bootcamp
    if(req.user.id !==review.user.toString() && req.user.role !== 'Admin' ){
        return next(
            new ErrorResponse(`User with id of ${req.user.id} have not permission to update this review.`,401)
        );
    }

    await review.remove();
    res.status(200).json({
        success:true,
        data:{}
    });
});

