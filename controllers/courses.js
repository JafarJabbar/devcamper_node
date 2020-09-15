const Course =require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const AsyncHandler=require('../middleware/async');
const Bootcamp = require("../models/Bootcamp");

//@desc Get all courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses
//@access Public
exports.getCourses =AsyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId){
        query = Course.find({bootcamp:req.params.bootcampId });
        let courses=await query;
        res.status(200).json({
            success:true,
            count:courses.length,
            data:courses
        });
    }else {
        res.status(200).json(res.advancedResults);
    }
});


//@desc Get single course
//@route GET /api/v1/courses/:id
//@access Public
exports.getCourse =AsyncHandler(async (req, res, next) => {
    let query;
    query = Course.findById(req.params.id );

    let course=await query;

    if (!course){
        next(new ErrorResponse(`No course in id of ${req.params.id} `),404);
    }
    res.status(200).json({
       success:true,
       data:course
    });
});

//@desc Add course
//@route POST /api/v1/bootcamps/:bootcampId/courses
//@access Public
exports.addCourse =AsyncHandler(async (req, res, next) => {
    req.body.bootcamp=req.params.bootcampId;
    let query;
    let bootcamp=Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        next(new ErrorResponse(`No bootcamp on id of ${req.params.bootcampId}`),404);
    }
    query=Course.create(req.body);
    let course=await query;
    res.status(200).json({
       success:true,
       data:course
    });
});

//@desc Update course
//@route PUT /api/v1/courses/:id
//@access Private
exports.updateCourse =AsyncHandler(async (req, res, next) => {
    let course=Course.findById(req.params.id);
    if(!course){
        next(new ErrorResponse(`No course on id of ${req.params.id}`),404);
    }
    course = await Course.findByIdAndUpdate(req.params.id,req.body,{
       new:true,
       runValidators:true
    });
    res.status(200).json({
       success:true,
       data:course
    });
});

//@desc Delete course
//@route Delete /api/v1/courses/:id
//@access Private
exports.deleteCourse =AsyncHandler(async (req, res, next) => {
    let course=Course.findById(req.params.id);
    if(!course){
        next(new ErrorResponse(`No course on id of ${req.params.id}`),404);
    }
    await course.remove();
    res.status(200).json({
       success:true,
       data:{}
    });
});

